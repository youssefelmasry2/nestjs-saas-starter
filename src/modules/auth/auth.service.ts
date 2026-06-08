import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { TokenService } from "../../core/accessControl/token/token.service";
import { TenantsService } from "../tenants/tenants.service";
import { LoginDto, RegisterDto, SwitchTenantDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
  ) {}

  private async buildAuthResponse(
    user: { id: string; role: string },
    tenantId?: string,
  ) {
    let tenantRole: string | undefined;

    if (tenantId) {
      const membership = await this.tenantsService.getMembership(
        user.id,
        tenantId,
      );
      if (!membership) {
        throw new ForbiddenException("You do not have access to this tenant");
      }
      tenantRole = membership.role;
    }

    const accessToken = this.tokenService.generateAccessToken(
      user,
      tenantId,
      tenantRole,
    );
    const refreshToken = await this.tokenService.generateRefreshToken(
      user,
      tenantId,
      tenantRole,
    );

    const tenants = await this.tenantsService.findUserTenants(user.id);

    return {
      accessToken,
      refreshToken,
      currentTenantId: tenantId ?? null,
      tenants,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await this.usersService.validatePassword(
      dto.password,
      user.passwordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    await this.usersService.updateLastLogin(user.id);

    const { passwordHash: _passwordHash, ...safeUser } = user;

    const tenants = await this.tenantsService.findUserTenants(user.id);
    const defaultTenantId = tenants[0]?.id;

    const tokens = await this.buildAuthResponse(user, defaultTenantId);

    return { user: safeUser, ...tokens };
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      email: dto.email,
      fullName: dto.fullName,
      password: dto.password,
      profileImageUrl: dto.profileImageUrl,
    });

    const tenant = await this.tenantsService.createWithOwner(
      user.id,
      dto.organizationName,
    );

    const tokens = await this.buildAuthResponse(user, tenant.id);

    return { user, tenant, ...tokens };
  }

  async switchTenant(userId: string, dto: SwitchTenantDto) {
    const user = await this.usersService.findOne(userId);
    return this.buildAuthResponse(user, dto.tenantId);
  }

  async logout(refreshToken: string) {
    const payload = await this.tokenService.validateRefreshToken(refreshToken);
    if (!payload?.sessionId) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    await this.tokenService.revokeSession(payload.sessionId);
    return { success: true };
  }

  async refreshToken(refreshToken: string) {
    return this.tokenService.rotateRefreshToken(refreshToken);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    const tenants = await this.tenantsService.findUserTenants(userId);
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      isVerified: user.isVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      tenants,
    };
  }
}
