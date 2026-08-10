import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { User, Session } from './models';
import { UserRole } from '../common/enums/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { serializeUser } from './serializers/user.serializer';
import { toJwtPayload } from './helpers/jwt-payload.helper';
import { AuthResponse, LogoutResponse } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Session)
    private readonly sessionModel: typeof Session,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userModel.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    const accessToken = this.jwtService.sign(toJwtPayload(user));

    const expiresAt = this.getSessionExpirationDate();
    await this.sessionModel.create({
      userId: user.id,
      token: accessToken,
      expiresAt,
    });

    return {
      user: serializeUser(user),
      accessToken,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userModel.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.jwtService.sign(toJwtPayload(user));

    const expiresAt = this.getSessionExpirationDate();
    await this.sessionModel.create({
      userId: user.id,
      token: accessToken,
      expiresAt,
    });

    return {
      user: serializeUser(user),
      accessToken,
    };
  }

  async logout(token: string | null): Promise<LogoutResponse> {
    if (token) {
      await this.sessionModel.destroy({
        where: { token },
      });
    }
    return { message: 'Logged out successfully' };
  }

  private getSessionExpirationDate(): Date {
    const ttlMs = this.configService.get<number>('SESSION_EXPIRES_IN_MS') || 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ttlMs);
  }
}
