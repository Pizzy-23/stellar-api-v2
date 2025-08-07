import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('clubs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new running club' })
  @ApiResponse({ status: 201, description: 'The club has been successfully created.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createClubDto: CreateClubDto, @Req() req) {
    return this.clubsService.create(createClubDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of all running clubs' })
  @ApiResponse({ status: 200, description: 'A list of all clubs.'})
  findAll() {
    return this.clubsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific club' })
  @ApiResponse({ status: 200, description: 'The club details.'})
  @ApiResponse({ status: 404, description: 'Club not found.' })
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a club (creator only)' })
  @ApiResponse({ status: 200, description: 'The club has been successfully updated.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(@Param('id') id: string, @Body() updateClubDto: UpdateClubDto, @Req() req) {
    return this.clubsService.update(id, updateClubDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a club (creator only)' })
  @ApiResponse({ status: 204, description: 'The club has been successfully deleted.'})
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req) {
    return this.clubsService.remove(id, req.user.userId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a specific club' })
  @ApiResponse({ status: 201, description: 'Successfully joined the club.' })
  joinClub(@Param('id') id: string, @Req() req) {
    return this.clubsService.joinClub(id, req.user.userId);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a specific club' })
  @ApiResponse({ status: 201, description: 'Successfully left the club.' })
  leaveClub(@Param('id') id: string, @Req() req) {
    return this.clubsService.leaveClub(id, req.user.userId);
  }
}