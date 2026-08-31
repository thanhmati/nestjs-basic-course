import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    createPost(body: CreatePostDto): import("../generated/prisma/models").Prisma__PostClient<{
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
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    createPostWithNotification(body: CreatePostDto): Promise<{
        title: string;
        content: string;
        published: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        authorId: number;
    }>;
    findAllPosts(search?: string, page?: number, limit?: number): Promise<{
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
    updatePost(id: number, updatePostDto: UpdatePostDto): Promise<{
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
