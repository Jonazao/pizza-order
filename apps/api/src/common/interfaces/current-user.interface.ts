import { UserRole } from '../enums/user-role.enum';

export interface CurrentUserEntity {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
