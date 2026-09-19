import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly SALT_ROUNDS = 10;

  async hashPassword(plainText: string) {
    return bcrypt.hash(plainText, this.SALT_ROUNDS);
  }

  async comparePassword(plainText: string, hash: string) {
    return bcrypt.compare(plainText, hash);
  }
}
