import { User } from '../models/user.model';
import { JwtPayload } from '../interfaces/auth.interface';

export function toJwtPayload(user: User): JwtPayload {
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
