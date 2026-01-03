import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatEvents } from './chat.events';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
        private chatGateway: ChatGateway,
    ) { }

    @Get('rooms')
    async getMyRooms(@Request() req) {
        return this.chatService.getMyRooms(req.user.userId);
    }

    @Get('rooms/:id/messages')
    async getMessages(@Request() req, @Param('id', ParseIntPipe) roomId: number) {
        return this.chatService.getMessages(roomId, req.user.userId);
    }

    @Post('rooms/:id/messages')
    async sendMessage(
        @Request() req,
        @Param('id', ParseIntPipe) roomId: number,
        @Body('content') content: string
    ) {
        const message = await this.chatService.sendMessage(roomId, req.user.userId, content);

        // Emit to room
        this.chatGateway.server.to(`room_${roomId}`).emit(ChatEvents.NEW_MESSAGE, message);

        return message;
    }
}
