import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
  import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);


export const AUTH_TYPE_KEY = 'authType';

export enum AuthType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export const AccessAuth = () =>
  applyDecorators(
    SetMetadata(AUTH_TYPE_KEY, AuthType.ACCESS),
    ApiBearerAuth('access-token'),
  );
export const RefreshAuth = () =>
  applyDecorators(
    SetMetadata(AUTH_TYPE_KEY, AuthType.REFRESH),
    ApiBearerAuth('refresh-token'),
  );



export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);