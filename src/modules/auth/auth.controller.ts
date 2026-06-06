import { AuthService } from './auth.service';
import {
    Controller,
    Get,
    Post,
    Body,
    Req,
} from '@nestjs/common';

import {
    ApiTags,
    ApiOperation,
} from '@nestjs/swagger';

import { Roles } from '../../core/accessControl/decorator/roles.decorator';
import { Public, RefreshAuth, AccessAuth, CurrentUser } from '../../core/accessControl/decorator/common.decorator';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @Public()
    @ApiOperation({ summary: 'Login user' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('register')
    @Public()
    @ApiOperation({ summary: 'Register user' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
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
getProfile(@CurrentUser() user: any) {
  return this.authService.getProfile(user.userId);
}
}
