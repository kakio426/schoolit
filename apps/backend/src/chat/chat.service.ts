import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async createRoom(user1Id: number, user2Id: number, jobId?: number) {
        // Check if room exists
        const existing = await this.prisma.chatRoom.findFirst({
            where: {
                AND: [
                    { users: { some: { id: user1Id } } },
                    { users: { some: { id: user2Id } } },
                    jobId ? { jobId } : {},
                ],
            },
        });

        if (existing) {
            return existing;
        }

        return this.prisma.chatRoom.create({
            data: {
                jobId,
                users: {
                    connect: [{ id: user1Id }, { id: user2Id }],
                },
            },
        });
    }

    async getMyRooms(userId: number) {
        return this.prisma.chatRoom.findMany({
            where: {
                users: { some: { id: userId } },
            },
            include: {
                users: {
                    where: {
                        id: { not: userId }
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        schoolProfile: { select: { schoolName: true, logoImage: true } },
                        teacherProfile: { select: { profileImage: true, bio: true } }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getMessages(roomId: number, userId: number) {
        const room = await this.prisma.chatRoom.findFirst({
            where: { id: roomId, users: { some: { id: userId } } }
        });
        if (!room) throw new ForbiddenException('Access denied');

        return this.prisma.chatMessage.findMany({
            where: { chatRoomId: roomId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true } }
            }
        });
    }

    async sendMessage(roomId: number, senderId: number, content: string) {
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: roomId },
            include: { users: { select: { id: true } } }
        });

        if (!room || !room.users.some(u => u.id === senderId)) {
            throw new ForbiddenException('Access denied');
        }

        return this.prisma.chatMessage.create({
            data: {
                chatRoomId: roomId,
                senderId,
                content
            },
            include: {
                sender: { select: { id: true, name: true } }
            }
        });
    }

    async getUserRooms(userId: number) {
        return this.prisma.chatRoom.findMany({
            where: { users: { some: { id: userId } } },
            select: { id: true }
        });
    }
}
