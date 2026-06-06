import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entity/tokens.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

interface TokenUser {
  id: string;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  generateAccessToken(
    user: TokenUser,
    tenantId?: string,
    tenantRole?: string,
  ): string {
    return this.jwtService.sign(
      {
        userId: user.id,
        role: user.role,
        tenantId,
        tenantRole,
        type: 'access',
      },
      { expiresIn: '50m' },
    );
  }

  async generateRefreshToken(
    user: TokenUser,
    tenantId?: string,
    tenantRole?: string,
  ): Promise<string> {
    const sessionId = randomUUID();

    const refreshToken = this.jwtService.sign(
      {
        userId: user.id,
        role: user.role,
        tenantId,
        tenantRole,
        type: 'refresh',
        sessionId,
      },
      { expiresIn: '30d' },
    );

    const hashed = await this.hashToken(refreshToken);

    await this.tokenRepository.save({
      sessionId,
      userId: user.id,
      hashRefreshToken: hashed,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return refreshToken;
  }

  validateAccessToken(token: string) {
    const payload = this.jwtService.verify(token);
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  }

  async validateRefreshToken(token: string) {
    const payload = this.jwtService.verify(token);

    if (payload.type !== 'refresh') {
      return null;
    }

    const session = await this.tokenRepository.findOne({
      where: { sessionId: payload.sessionId },
    });

    if (!session) return null;
    if (session.revoked) return null;
    if (session.expiresAt < new Date()) return null;

    const match = await bcrypt.compare(token, session.hashRefreshToken);
    if (!match) return null;

    return payload;
  }

  private async hashToken(token: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(token, salt);
  }

  async revokeSession(sessionId: string) {
    await this.tokenRepository.update({ sessionId }, { revoked: true });
  }

  async rotateRefreshToken(refreshToken: string) {
    const payload = await this.validateRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.revokeSession(payload.sessionId);

    const user = {
      id: payload.userId,
      role: payload.role,
    };

    const newAccessToken = this.generateAccessToken(
      user,
      payload.tenantId,
      payload.tenantRole,
    );
    const newRefreshToken = await this.generateRefreshToken(
      user,
      payload.tenantId,
      payload.tenantRole,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      currentTenantId: payload.tenantId ?? null,
    };
  }
}
