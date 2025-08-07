import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createClubDto: CreateClubDto, userId: string): Promise<Club> {
    const creator = await this.userRepository.findOneBy({ id: userId });
    if (!creator) {
      throw new NotFoundException(`Creator with User ID ${userId} not found.`);
    }

    const club = this.clubRepository.create({
      ...createClubDto,
      creator,
      members: [creator],
    });

    return this.clubRepository.save(club);
  }

  findAll(): Promise<Club[]> {
    return this.clubRepository.find({
      relations: ['creator', 'members'],
    });
  }

  async findOne(id: string): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { id },
      relations: ['creator', 'members'],
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found.`);
    }
    return club;
  }

  async update(id: string, updateClubDto: UpdateClubDto, userId: string): Promise<Club> {
    const club = await this.findOne(id);

    if (club.creator.id !== userId) {
      throw new ForbiddenException('You are not authorized to update this club.');
    }

    Object.assign(club, updateClubDto);
    return this.clubRepository.save(club);
  }

  async remove(id: string, userId: string): Promise<void> {
    const club = await this.findOne(id);

    if (club.creator.id !== userId) {
      throw new ForbiddenException('You are not authorized to delete this club.');
    }

    await this.clubRepository.remove(club);
  }

  async joinClub(clubId: string, userId: string): Promise<Club> {
    const club = await this.findOne(clubId);
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const isAlreadyMember = club.members.some(member => member.id === user.id);
    if (isAlreadyMember) {
      return club;
    }
    
    club.members.push(user);
    return this.clubRepository.save(club);
  }

  async leaveClub(clubId: string, userId: string): Promise<Club> {
    const club = await this.findOne(clubId);
    club.members = club.members.filter(member => member.id !== userId);
    return this.clubRepository.save(club);
  }
}