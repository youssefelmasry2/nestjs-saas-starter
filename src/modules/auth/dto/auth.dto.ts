import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  fullName: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'Acme Corp',
    description: 'Organization name — a new tenant is created on signup',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  organizationName: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;
}

export class SwitchTenantDto {
  @ApiProperty({ description: 'Tenant UUID to switch to' })
  @IsString()
  tenantId: string;
}
