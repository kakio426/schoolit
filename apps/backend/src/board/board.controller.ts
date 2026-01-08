import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BoardService } from './board.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/boards')
export class BoardController {
    constructor(private readonly boardService: BoardService) { }

    // ============================================
    // Board Endpoints
    // ============================================

    /**
     * 모든 게시판 목록 조회
     * GET /api/boards
     */
    @Get()
    async getAllBoards() {
        return this.boardService.getAllBoards();
    }

    /**
     * 특정 게시판 조회
     * GET /api/boards/:id
     */
    @Get(':id')
    async getBoardById(@Param('id', ParseIntPipe) id: number) {
        return this.boardService.getBoardById(id);
    }

    /**
     * 게시판 생성 (관리자 전용)
     * POST /api/boards
     */
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    async createBoard(
        @Body() body: { title: string; description?: string; category: string; isPublic?: boolean },
    ) {
        return this.boardService.createBoard(body);
    }

    // ============================================
    // Post Endpoints
    // ============================================

    /**
     * 게시판의 게시글 목록 조회
     * GET /api/boards/:boardId/posts
     */
    @Get(':boardId/posts')
    async getPostsByBoard(
        @Param('boardId', ParseIntPipe) boardId: number,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.boardService.getPostsByBoard(
            boardId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    /**
     * 게시글 작성
     * POST /api/boards/:boardId/posts
     */
    @UseGuards(AuthGuard('jwt'))
    @Post(':boardId/posts')
    @UseInterceptors(
        FilesInterceptor('images', 5, {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
                    return cb(new Error('Only image files are allowed'), false);
                }
                cb(null, true);
            },
        }),
    )
    async createPost(
        @Request() req,
        @Param('boardId', ParseIntPipe) boardId: number,
        @Body() body: { title: string; content: string },
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        return this.boardService.createPost(req.user.userId, req.user.role, boardId, body, files);
    }

    /**
     * 게시글 상세 조회
     * GET /api/boards/posts/:postId
     */
    @Get('posts/:postId')
    async getPostById(@Param('postId', ParseIntPipe) postId: number) {
        return this.boardService.getPostById(postId);
    }

    /**
     * 게시글 수정
     * PATCH /api/boards/posts/:postId
     */
    @UseGuards(AuthGuard('jwt'))
    @Patch('posts/:postId')
    @UseInterceptors(
        FilesInterceptor('images', 5, {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    async updatePost(
        @Request() req,
        @Param('postId', ParseIntPipe) postId: number,
        @Body() body: { title?: string; content?: string },
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        return this.boardService.updatePost(postId, req.user.userId, req.user.role, body, files);
    }

    /**
     * 게시글 삭제
     * DELETE /api/boards/posts/:postId
     */
    @UseGuards(AuthGuard('jwt'))
    @Delete('posts/:postId')
    async deletePost(@Request() req, @Param('postId', ParseIntPipe) postId: number) {
        const isAdmin = req.user.role === 'ADMIN';
        return this.boardService.deletePost(postId, req.user.userId, isAdmin);
    }

    // ============================================
    // Comment Endpoints
    // ============================================

    /**
     * 댓글 작성
     * POST /api/boards/posts/:postId/comments
     */
    @UseGuards(AuthGuard('jwt'))
    @Post('posts/:postId/comments')
    async createComment(
        @Request() req,
        @Param('postId', ParseIntPipe) postId: number,
        @Body() body: { content: string; parentId?: number },
    ) {
        return this.boardService.createComment(
            postId,
            req.user.userId,
            body.content,
            body.parentId,
        );
    }

    /**
     * 댓글 삭제
     * DELETE /api/boards/comments/:commentId
     */
    @UseGuards(AuthGuard('jwt'))
    @Delete('comments/:commentId')
    async deleteComment(
        @Request() req,
        @Param('commentId', ParseIntPipe) commentId: number,
    ) {
        const isAdmin = req.user.role === 'ADMIN';
        return this.boardService.deleteComment(commentId, req.user.userId, isAdmin);
    }

    // ============================================
    // Like Endpoints
    // ============================================

    /**
     * 좋아요 토글
     * POST /api/boards/posts/:postId/like
     */
    @UseGuards(AuthGuard('jwt'))
    @Post('posts/:postId/like')
    async toggleLike(
        @Request() req,
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        return this.boardService.toggleLike(postId, req.user.userId);
    }

    /**
     * 좋아요 상태 확인
     * GET /api/boards/posts/:postId/like
     */
    @UseGuards(AuthGuard('jwt'))
    @Get('posts/:postId/like')
    async hasUserLiked(
        @Request() req,
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        const hasLiked = await this.boardService.hasUserLiked(postId, req.user.userId);
        const count = await this.boardService.getLikeCount(postId);
        return { hasLiked, count };
    }

    // ============================================
    // Admin Endpoints
    // ============================================

    /**
     * 게시글 고정/해제 (관리자 전용)
     * PATCH /api/boards/posts/:postId/pin
     */
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Patch('posts/:postId/pin')
    async pinPost(
        @Param('postId', ParseIntPipe) postId: number,
        @Body() body: { isPinned: boolean },
    ) {
        return this.boardService.pinPost(postId, body.isPinned);
    }
}
