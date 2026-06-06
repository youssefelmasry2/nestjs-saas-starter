import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TenantMemberRole } from '../entities/tenant-member.entity';

export class CreateTenantDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: TenantMemberRole, default: TenantMemberRole.MEMBER })
  @IsOptional()
  @IsEnum(TenantMemberRole)
  role?: TenantMemberRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: TenantMemberRole })
  @IsEnum(TenantMemberRole)
  role: TenantMemberRole;
}
