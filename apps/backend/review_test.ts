import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { CloudinaryService } from './src/common/storage/cloudinary.service';
import { ReviewsService } from './src/reviews/reviews.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function testReviewUpload() {
    const prisma = new PrismaClient();
    const configService = new ConfigService();
    const cloudinaryService = new CloudinaryService(configService);
    const reviewsService = new ReviewsService(prisma as any, cloudinaryService);

    const imagePath = 'C:/Users/kakio/.gemini/antigravity/brain/a9978ffc-11e0-4e8d-b412-06928ef18d18/test_review_image_1767883776324.png';

    try {
        console.log('1. Updating application to HIRED...');
        await prisma.jobApplication.upsert({
            where: { jobId_userId: { jobId: 1, userId: 3 } },
            update: { status: ApplicationStatus.HIRED },
            create: {
                jobId: 1,
                userId: 3,
                status: ApplicationStatus.HIRED,
                message: 'Test hired application'
            }
        });

        console.log('2. Preparing mock file...');
        const buffer = fs.readFileSync(imagePath);
        const mockFile: any = {
            buffer,
            originalname: 'test_review_image.png',
            mimetype: 'image/png',
            size: buffer.length,
            fieldname: 'images',
        };

        console.log('3. Calling ReviewsService.createReview...');
        const result = await reviewsService.createReview(
            {
                jobId: 1,
                receiverId: 3,
                content: '업체의 서비스가 매우 훌륭했습니다. 행사 진행이 매끄럽고 결과물도 만족스럽습니다. 추천합니다!',
                rating: 5,
                keywords: ['친절함', '전문성', '철저한 준비'],
                reMatchIntent: true
            },
            2, // Sender ID (School)
            [mockFile]
        );

        console.log('SUCCESS! Review Created:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('FAILED during test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testReviewUpload();
