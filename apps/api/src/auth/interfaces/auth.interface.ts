import { UserRole } from '../../common/enums/user-role.enum';
import { SerializedUser } from '../serializers/user.serializer';

export interface UserAttributes {
  id?: string;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SessionAttributes {
  id?: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  user: SerializedUser;
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}
