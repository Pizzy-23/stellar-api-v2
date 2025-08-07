import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }
}
