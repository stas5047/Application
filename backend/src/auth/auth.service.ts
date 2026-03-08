import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service';
import { UserPayloadDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserPayloadDto;
}

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    email: string,
    username: string,
    password: string,
  ): Promise<AuthTokens> {
    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }
    const existingUsername = await this.usersService.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.usersService.create(email, username, passwordHash);
    const tokens = this.issueTokenPair(user.id, user.username);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);
    return { ...tokens, user: { id: user.id, username: user.username } };
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = this.issueTokenPair(user.id, user.username);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);
    return { ...tokens, user: { id: user.id, username: user.username } };
  }

  async refresh(rawToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(rawToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const tokenMatch = await bcrypt.compare(rawToken, user.refreshTokenHash);
    if (!tokenMatch) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const tokens = this.issueTokenPair(user.id, user.username);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);
    return { ...tokens, user: { id: user.id, username: user.username } };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshTokenHash(userId, null);
  }

  private issueTokenPair(
    userId: string,
    username: string,
  ): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = { sub: userId, username };
    const accessToken = this.jwtService.sign(payload);
    const refreshSignOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ) as StringValue,
    };
    const refreshToken = this.jwtService.sign(payload, refreshSignOptions);
    return { accessToken, refreshToken };
  }

  private async storeRefreshTokenHash(
    userId: string,
    rawToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(rawToken, BCRYPT_ROUNDS);
    await this.usersService.updateRefreshTokenHash(userId, hash);
  }
}
