import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString, IsStrongPassword, IsUrl, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class RegisterDto{
@ApiProperty({example: '+201025734189',})
  @IsPhoneNumber('EG')
  phone: string;

  @ApiProperty({example: 'John Doe',})
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  fullName: string;

  @ApiProperty({
    example: 'StrongPassword123',
  })
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  
}