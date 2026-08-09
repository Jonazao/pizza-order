import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { User, UserRole, Session } from '../models';
import { serializeUser } from '../serializers/user.serializer';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Session)
    private readonly sessionModel: typeof Session,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const rawToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!rawToken) {
      throw new UnauthorizedException('Missing authentication token');
    }

    // Verify active session exists in DB
    const session = await this.sessionModel.findOne({
      where: { token: rawToken, userId: payload.sub },
    });

    if (!session) {
      throw new UnauthorizedException('Session expired or invalidated');
    }

    // Verify user exists in DB
    const user = await this.userModel.findByPk(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return serializeUser(user);
  }
}
