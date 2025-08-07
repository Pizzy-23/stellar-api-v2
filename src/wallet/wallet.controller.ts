import {
  Controller,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly usersService: UsersService,
  ) {}

  @Get('balance')
  @ApiOperation({ summary: "Get the current user's wallet balance" })
  @ApiResponse({ status: 200, description: 'The wallet balances.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'User or Stellar account not found.',
  })
  async getBalance(@Req() req) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException();
    }
    const userProfile = await this.usersService.getProfileById(req.user.userId);

    if (!userProfile.stellarAddress) {
      throw new NotFoundException('Stellar address not found for this user.');
    }

    return this.walletService.getAccountBalance(userProfile.stellarAddress);
  }
}
