import type { ExecutionContext } from "@nestjs/common";
import {
  createParamDecorator,
  SetMetadata,
  applyDecorators,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import type { JwtPayload } from "../types/jwt-payload.type";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const AUTH_TYPE_KEY = "authType";

export enum AuthType {
  ACCESS = "access",
  REFRESH = "refresh",
}

export const AccessAuth = () =>
  applyDecorators(
    SetMetadata(AUTH_TYPE_KEY, AuthType.ACCESS),
    ApiBearerAuth("access-token"),
  );

export const RefreshAuth = () =>
  applyDecorators(
    SetMetadata(AUTH_TYPE_KEY, AuthType.REFRESH),
    ApiBearerAuth("refresh-token"),
  );

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
