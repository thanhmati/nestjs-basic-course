export class CommentCreatedEvent {
  constructor(
    public readonly commentId: number,
    public readonly postId: number,
    public readonly postTitle: string,
    public readonly postAuthorId: number,
    public readonly commentAuthorId: number,
    public readonly commentAuthorName: string,
    public readonly content: string,
  ) {}
}
