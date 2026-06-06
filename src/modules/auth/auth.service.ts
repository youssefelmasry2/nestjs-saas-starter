import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokenService } from '../../core/accessControl/token/token.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByPhone(dto.phone);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.usersService.validatePassword(
      dto.password,
      user.passwordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken =
      this.tokenService.generateAccessToken(user);

    const refreshToken =
      await this.tokenService.generateRefreshToken(user);

      await this.usersService.updateLastLogin(user.id);

      delete user.passwordHash;

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async register(dto: any) {
    const user = await this.usersService.create(dto);

    const accessToken = this.tokenService.generateAccessToken(user);

    const refreshToken = await this.tokenService.generateRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
}

async logout(refreshToken: string) {
  const payload = await this.tokenService.validateRefreshToken(refreshToken);

  const sessionId = payload.sessionId;

    await this.tokenService.revokeSession(sessionId);

  return { success: true };
}

async refreshToken(refreshToken: string) {
  const newTokens = await this.tokenService.rotateRefreshToken(refreshToken);

  if (!newTokens) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  return newTokens;
}
  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
}}