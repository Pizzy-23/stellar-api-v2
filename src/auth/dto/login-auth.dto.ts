import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user.',
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The user password (at least 8 characters).',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}