import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserEntity } from '../interfaces/current-user.interface';

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
