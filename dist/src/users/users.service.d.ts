export interface User {
    id: number;
    name: string;
    email: string;
}
export declare class UsersService {
    private users;
    findAll(): User[];
}
