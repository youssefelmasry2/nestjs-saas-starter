import {
  IsString,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
  isBoolean,
  IsBoolean,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { UserRole } from '../entity/users.entity';

export class CreateUserDto {
  @ApiProperty({
    example: '+201025734189',
  })
  @IsPhoneNumber('EG')
  phone: string;

  @ApiProperty({
    example: 'John Doe',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    example: 'StrongPassword123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiPropertyOptional({
    example: 'Cairo',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'Cairo',
  })
  @IsOptional()
  @IsString()
  governorate?: string;

  @ApiPropertyOptional({
    example: 'Nasr City, Cairo',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'user',
  })
  @IsString()
  role: UserRole;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isVerified: boolean;

}

export class UpdateUserDto extends CreateUserDto{
}