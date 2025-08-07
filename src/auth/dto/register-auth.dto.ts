import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoginDto } from './login-auth.dto';

export class RegisterDto extends LoginDto {
  @ApiProperty({
    description: 'The username for the new user.',
    example: 'testuser',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}