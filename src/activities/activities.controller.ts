import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { AuthGuard } from '@nestjs/passport';
import { LogRunDto } from './dto/log-run.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('activities')
@ApiBearerAuth() 
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post('run')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Log a new run for the authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'The run has been successfully logged and tokens have been minted.',
    schema: {
      example: {
        message: 'Run logged and tokens minted successfully!',
        tokensMinted: 5,
        transaction: 'abcdef123456...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., invalid input data).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User or their Stellar Wallet not found.' })
  logUserRun(@Body() logRunDto: LogRunDto, @Req() req) {
    const userId = req.user.userId;
    return this.activitiesService.processNewRun(userId, logRunDto);
  }
}