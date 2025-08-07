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

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException();
    }
    return this.usersService.getProfileById(req.user.userId);
  }

  @Patch('profile')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException();
    }
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Req() req) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException();
    }
    await this.usersService.softDelete(req.user.userId);
  }
}
