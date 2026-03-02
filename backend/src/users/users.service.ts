import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const user = this.userRepository.create({
      email,
      passwordHash,
      refreshTokenHash: null,
    });
    return this.userRepository.save(user);
  }

  async updateRefreshTokenHash(
    userId: string,
    hash: string | null,
  ): Promise<void> {
    await this.userRepository.update(userId, { refreshTokenHash: hash });
  }
}
