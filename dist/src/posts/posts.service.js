"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PostsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const prisma_service_1 = require("../prisma/prisma.service");
const common_1 = require("@nestjs/common");
let PostsService = PostsService_1 = class PostsService {
    prisma;
    logger = new common_1.Logger(PostsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    createPost(params) {
        const { authorId, content, title } = params;
        return this.prisma.post.create({
            data: {
                title,
                content,
                published: true,
                author: {
                    connect: {
                        id: authorId,
                    },
                },
            },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async createPostWithNotification(params) {
        const { authorId, content, title } = params;
        return this.prisma.$transaction(async (tx) => {
            const author = await tx.user.findUnique({
                where: { id: authorId },
            });
            if (!author) {
                throw new common_1.NotFoundException(`Không tìm thấy tác giả với ID ${authorId}`);
            }
            const post = await tx.post.create({
                data: {
                    content,
                    title,
                    author: {
                        connect: {
                            id: authorId,
                        },
                    },
                },
            });
            const notification = await tx.notification.create({
                data: {
                    userId: authorId,
                    content: `Bài viết "${post.title}" của bạn đã được phát hành thành công.`,
                    title: 'Bài viết được phát hành thành công',
                },
            });
            this.logger.debug({ post, notification });
            throw new common_1.BadRequestException('TEST transaction');
            return post;
        }, {
            maxWait: 5000,
            timeout: 10000,
        });
    }
    async findAllPost(params) {
        const { search, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const whereCondition = {
            published: true,
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        const [items, total] = await Promise.all([
            this.prisma.post.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    author: {
                        select: { id: true, name: true },
                    },
                    _count: {
                        select: { comments: true },
                    },
                },
            }),
            this.prisma.post.count({ where: whereCondition }),
        ]);
        return {
            data: items,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
    async updatePost(id, title, content) {
        try {
            return await this.prisma.post.update({
                where: { id },
                data: {
                    ...(title && { title }),
                    ...(content && { content }),
                },
            });
        }
        catch {
            throw new common_1.NotFoundException(`Không tìm thấy bài viết với ID ${id}`);
        }
    }
    async deletePost(id) {
        try {
            return await this.prisma.post.delete({
                where: { id },
            });
        }
        catch {
            throw new common_1.NotFoundException(`Không thể xóa! Bài viết ID ${id} không tồn tại.`);
        }
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = PostsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostsService);
//# sourceMappingURL=posts.service.js.map