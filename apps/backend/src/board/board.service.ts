import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IStorageService, STORAGE_SERVICE } from '../common/storage/interfaces/storage.interface';

@Injectable()
export class BoardService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private storageService: IStorageService,
  ) {}

  async onModuleInit() {
    await this.seedBoards();
  }

  private async seedBoards() {
    const defaultBoards = [
      {
        title: '공지사항',
        description: '스쿨잇의 새로운 소식을 전해드립니다.',
        category: 'NOTICE',
      },
      {
        title: '자유게시판',
        description: '자유롭게 정보를 공유하고 이야기 나누는 공간입니다.',
        category: 'FREE',
      },
      {
        title: '질문과 답변',
        description: '궁금한 점을 묻고 전문가의 답변을 받아보세요.',
        category: 'QNA',
      },
      {
        title: '후기게시판',
        description: '생생한 업체 이용 후기를 공유합니다.',
        category: 'REVIEW_BOARD',
      },
    ];

    try {
      for (const board of defaultBoards) {
        await this.prisma.board.upsert({
          where: { category: board.category },
          update: {},
          create: {
            ...board,
            isPublic: true,
          },
        });
      }
      console.log('✅ Default boards initialized successfully');
    } catch (error) {
      console.error('❌ Failed to seed default boards:', error);
    }
  }

  // ============================================
  // Board CRUD
  // ============================================

  async createBoard(data: {
    title: string;
    description?: string;
    category: string;
    isPublic?: boolean;
  }) {
    return this.prisma.board.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        isPublic: data.isPublic ?? true,
      },
    });
  }

  async getAllBoards() {
    return this.prisma.board.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getBoardByCategory(category: string) {
    return this.prisma.board.findFirst({
      where: { category },
    });
  }

  async getBoardById(id: number) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        posts: {
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          take: 20,
          include: {
            author: { select: { id: true, name: true, role: true } },
            _count: { select: { comments: true, likes: true } },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('게시판을 찾을 수 없습니다.');
    }

    return board;
  }

  // ============================================
  // Post CRUD
  // ============================================

  async createPost(
    userId: number,
    userRole: string,
    boardId: number,
    data: { title: string; content: string },
    files?: Express.Multer.File[],
  ) {
    // 1. Verify board and category
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('게시판을 찾을 수 없습니다.');
    }

    // 공지사항(NOTICE) 게시판은 관리자(ADMIN)만 작성 가능
    if (board.category === 'NOTICE' && userRole !== 'ADMIN') {
      throw new ForbiddenException('공지사항은 관리지만 작성할 수 있습니다.');
    }

    // 2. Upload images if provided
    const imageIds: string[] = [];
    if (files && files.length > 0) {
      for (const file of files.slice(0, 5)) {
        // Max 5 images
        const imageId = await this.storageService.uploadFile(file, 'posts');
        imageIds.push(imageId);
      }
    }

    // 3. Create post
    return this.prisma.post.create({
      data: {
        boardId,
        authorId: userId,
        title: data.title,
        content: data.content,
        imageIds,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async getPostsByBoard(boardId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { boardId },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, role: true, isDeleted: true } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      this.prisma.post.count({ where: { boardId } }),
    ]);

    // Convert imageIds to URLs
    const postsWithUrls = posts.map((post) => ({
      ...post,
      imageUrls: post.imageIds.map((id) => this.storageService.getFileUrl(id)),
      author: post.author.isDeleted ? { ...post.author, name: '탈퇴한 사용자' } : post.author,
    }));

    return {
      posts: postsWithUrls,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPostById(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, name: true, role: true, isDeleted: true } },
        board: { select: { id: true, title: true, category: true } },
        comments: {
          where: { parentId: null }, // Top-level comments only
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, role: true, isDeleted: true } },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                author: { select: { id: true, name: true, role: true, isDeleted: true } },
              },
            },
          },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // Increment view count
    await this.prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    // Convert imageIds to URLs and mask deleted users
    return {
      ...post,
      imageUrls: post.imageIds.map((id) => this.storageService.getFileUrl(id)),
      author: post.author.isDeleted ? { ...post.author, name: '탈퇴한 사용자' } : post.author,
      comments: post.comments.map((comment) => ({
        ...comment,
        author: comment.author.isDeleted
          ? { ...comment.author, name: '탈퇴한 사용자' }
          : comment.author,
        replies: comment.replies.map((reply) => ({
          ...reply,
          author: reply.author.isDeleted
            ? { ...reply.author, name: '탈퇴한 사용자' }
            : reply.author,
        })),
      })),
    };
  }

  async updatePost(
    postId: number,
    userId: number,
    userRole: string,
    data: { title?: string; content?: string },
    files?: Express.Multer.File[],
  ) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const isAdmin = userRole === 'ADMIN';
    if (post.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('본인의 글만 수정할 수 있습니다.');
    }

    // Upload new images if provided
    let imageIds = post.imageIds;
    if (files && files.length > 0) {
      // Delete old images
      for (const oldId of post.imageIds) {
        await this.storageService.deleteFile(oldId).catch(() => {});
      }

      // Upload new images
      imageIds = [];
      for (const file of files.slice(0, 5)) {
        const imageId = await this.storageService.uploadFile(file, 'posts');
        imageIds.push(imageId);
      }
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        ...data,
        imageIds,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async deletePost(postId: number, userId: number, isAdmin = false) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('본인의 글만 삭제할 수 있습니다.');
    }

    // Delete images from storage
    for (const imageId of post.imageIds) {
      await this.storageService.deleteFile(imageId).catch(() => {});
    }

    await this.prisma.post.delete({ where: { id: postId } });
    return { deleted: true };
  }

  // ============================================
  // Comment CRUD
  // ============================================

  async createComment(postId: number, userId: number, content: string, parentId?: number) {
    // Verify post exists
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // If reply, verify parent comment exists
    if (parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== postId) {
        throw new NotFoundException('원본 댓글을 찾을 수 없습니다.');
      }
    }

    return this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content,
        parentId,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async deleteComment(commentId: number, userId: number, isAdmin = false) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('본인의 댓글만 삭제할 수 있습니다.');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { deleted: true };
  }

  // ============================================
  // Like System
  // ============================================

  async toggleLike(postId: number, userId: number) {
    const existing = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });

    if (existing) {
      // Unlike
      await this.prisma.postLike.delete({
        where: { id: existing.id },
      });
      return { liked: false };
    } else {
      // Like
      await this.prisma.postLike.create({
        data: { postId, userId },
      });
      return { liked: true };
    }
  }

  async getLikeCount(postId: number) {
    return this.prisma.postLike.count({ where: { postId } });
  }

  async hasUserLiked(postId: number, userId: number) {
    const like = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });
    return !!like;
  }

  // ============================================
  // Admin Functions
  // ============================================

  async pinPost(postId: number, isPinned: boolean) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { isPinned },
    });
  }
}
