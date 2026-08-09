import { User, UserRole } from '../models/user.model';

export interface SerializedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export function serializeUser(user: User): SerializedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
