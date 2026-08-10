import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../auth/models';

export interface CurrentUserEntity {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserEntity | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserEntity;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
