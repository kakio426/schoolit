import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
    private client: S3Client | null = null;
    private bucket: string;
    private isConfigured: boolean = false;

    constructor(private configService: ConfigService) {
        const region = this.configService.get<string>('AWS_S3_REGION');
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        this.bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME') || 'test-bucket';

        // Graceful degradation - don't crash if AWS is not configured
        if (!region || !accessKeyId || !secretAccessKey) {
            console.warn('⚠️ AWS credentials not configured. File upload features will be disabled.');
            this.isConfigured = false;
            return;
        }

        this.isConfigured = true;
        this.client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    getClient(): S3Client | null {
        return this.client;
    }

    async upload(file: any, tags: string): Promise<{ key: string; location: string }> {
        if (!this.isConfigured || !this.client) {
            throw new Error('S3 storage is not configured. File upload is disabled.');
        }

        const key = randomUUID();
        const originalName = file.originalname || '';
        const extension = originalName.split('.').pop();
        const fullKey = extension ? `${key}.${extension}` : key;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: fullKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            Tagging: tags,
        });

        await this.client.send(command);

        const location = `https://${this.bucket}.s3.amazonaws.com/${fullKey}`;

        return { key: fullKey, location };
    }

    async deleteMany(keys: string[]) {
        if (!keys.length) return;
        if (!this.isConfigured || !this.client) {
            console.warn('S3 not configured, skipping file deletion.');
            return;
        }

        const command = new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: {
                Objects: keys.map(k => ({ Key: k })),
                Quiet: false
            }
        });

        return this.client.send(command);
    }
}
