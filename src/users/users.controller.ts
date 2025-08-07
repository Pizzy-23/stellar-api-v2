import {
  Controller,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Req() req) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException();
    }
    return this.usersService.getProfileById(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException();
    }
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Req() req) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException();
    }
    await this.usersService.softDelete(req.user.userId);
  }
}
