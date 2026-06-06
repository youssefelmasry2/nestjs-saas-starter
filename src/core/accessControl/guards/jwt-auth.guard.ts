import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../token/token.service';
import { AuthType } from '../decorator/common.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      'isPublic',
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) return true;

    const authType = this.reflector.getAllAndOverride<AuthType>(
      'authType',
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) return false;

    const token = auth.split(' ')[1];

    try {
      if (authType === AuthType.REFRESH) {
        const payload = await this.tokenService.validateRefreshToken(token);
        if (!payload) return false;

        request.user = payload;
        request.refreshToken = token;
        return true;
      }

      // default = access
      const payload = this.tokenService.validateAccessToken(token);
      request.user = payload;
      console.log('payload', payload);
      return true;

    } catch {
      return false;
    }
  }
}