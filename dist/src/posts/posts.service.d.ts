import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
export declare class PostsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createPost(params: {
        authorId: number;
        title: string;
        content: string;
    }): Prisma.Prisma__PostClient<{
        title: string;
        content: string;
        createdAt: Date;
        author: {
            id: number;
            email: string;
            name: string | null;
        };
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: Prisma.GlobalOmitConfig | undefined;
    }>;
    createPostWithNotification(params: {
        authorId: number;
        title: string;
        content: string;
    }): Promise<{
        title: string;
        content: string;
        published: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        authorId: number;
    }>;
    findAllPost(params: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            title: string;
            createdAt: Date;
            author: {
                id: number;
                name: string | null;
            };
            id: number;
            _count: {
                comments: number;
            };
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    updatePost(id: number, title?: string, content?: string): Promise<{
        title: string;
        content: string;
        published: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        authorId: number;
    }>;
    deletePost(id: number): Promise<{
        title: string;
        content: string;
        published: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        authorId: number;
    }>;
}
