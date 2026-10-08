export class UserRegisteredEvent {
  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly name: string | null,
    public readonly createdAt: Date,
  ) {}
}
