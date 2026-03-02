import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    passwordHash: '',
    refreshTokenHash: null as string | null,
    createdAt: new Date(),
    organizedEvents: [],
    participatedEvents: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateRefreshTokenHash: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(
              (key: string) =>
                ({
                  JWT_REFRESH_SECRET: 'test-refresh-secret',
                  JWT_REFRESH_EXPIRES_IN: '7d',
                })[key],
            ),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should return accessToken and refreshToken on success', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({ ...mockUser });
      usersService.updateRefreshTokenHash.mockResolvedValue(undefined);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.register('test@example.com', 'password123');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw ConflictException for duplicate email', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser });

      await expect(
        service.register('test@example.com', 'password123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token pair on success', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
      });
      usersService.updateRefreshTokenHash.mockResolvedValue(undefined);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login('test@example.com', 'password123');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
      });

      await expect(
        service.login('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return rotated token pair for valid token', async () => {
      const oldRefreshToken = 'old-refresh-token';
      const existingHash = await bcrypt.hash(oldRefreshToken, 10);
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
      });
      usersService.findById.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: existingHash,
      });
      usersService.updateRefreshTokenHash.mockResolvedValue(undefined);
      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refresh(oldRefreshToken);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.refreshToken).not.toBe(oldRefreshToken);
    });

    it('should throw UnauthorizedException for invalid/expired token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should call updateRefreshTokenHash with null', async () => {
      usersService.updateRefreshTokenHash.mockResolvedValue(undefined);

      await service.logout(mockUser.id);

      expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith(
        mockUser.id,
        null,
      );
    });
  });
});
