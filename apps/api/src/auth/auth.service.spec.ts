import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User, Session } from './models';
import { UserRole } from '../common/enums/user-role.enum';

interface MockUserModel {
  findOne: jest.Mock;
  create: jest.Mock;
}

interface MockSessionModel {
  create: jest.Mock;
  destroy: jest.Mock;
}

interface MockJwtService {
  sign: jest.Mock;
}

interface MockConfigService {
  get: jest.Mock;
}

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: MockUserModel;
  let mockSessionModel: MockSessionModel;
  let mockJwtService: MockJwtService;
  let mockConfigService: MockConfigService;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    mockSessionModel = {
      create: jest.fn(),
      destroy: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue(86400000),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Session),
          useValue: mockSessionModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
        role: UserRole.CUSTOMER,
      });

      const result = await service.register({
        email: 'JOHN@example.com',
        password: 'password123',
        name: 'John Doe',
      });

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockSessionModel.create).toHaveBeenCalled();
      expect(result).toEqual({
        user: {
          id: 'user-1',
          email: 'john@example.com',
          name: 'John Doe',
          role: UserRole.CUSTOMER,
        },
        accessToken: 'mock-jwt-token',
      });
    });

    it('should throw ConflictException if user email already exists', async () => {
      mockUserModel.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should log in a user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUserModel.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
        password: hashedPassword,
        role: UserRole.CUSTOMER,
      });

      const result = await service.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: {
          id: 'user-1',
          email: 'john@example.com',
          name: 'John Doe',
          role: UserRole.CUSTOMER,
        },
        accessToken: 'mock-jwt-token',
      });
    });

    it('should throw UnauthorizedException for invalid email or password', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should destroy session for provided token', async () => {
      mockSessionModel.destroy.mockResolvedValue(1);

      const result = await service.logout('some-valid-token');

      expect(mockSessionModel.destroy).toHaveBeenCalledWith({
        where: { token: 'some-valid-token' },
      });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
