import { AuthService } from './auth.service';
import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Public,
  RefreshAuth,
  AccessAuth,
  CurrentUser,
} from '../../core/accessControl/decorator/common.decorator';
import { LoginDto, RegisterDto, SwitchTenantDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login and receive tenant-scoped tokens' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'Register user, create organization tenant, and start free trial',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('switch-tenant')
  @AccessAuth()
  @ApiOperation({ summary: 'Switch active tenant and get new tokens' })
  switchTenant(
    @CurrentUser() user: { userId: string },
    @Body() dto: SwitchTenantDto,
  ) {
    return this.authService.switchTenant(user.userId, dto);
  }

  @Post('logout')
  @RefreshAuth()
  logout(@Req() req: Request) {
    const refreshToken = (req.headers as any).authorization?.split(' ')[1];
    return this.authService.logout(refreshToken);
  }

  @Post('refresh')
  @RefreshAuth()
  refreshToken(@Req() req: Request) {
    const refreshToken = (req.headers as any).authorization?.split(' ')[1];
    return this.authService.refreshToken(refreshToken);
  }

  @Get('profile')
  @AccessAuth()
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.authService.getProfile(user.userId);
  }
}
