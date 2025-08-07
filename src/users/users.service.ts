import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Keypair } from 'stellar-sdk';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'> & { secret: string }> {
    const keypair = Keypair.random();
    const stellarAddress = keypair.publicKey();
    const secret = keypair.secret();

    const user = this.userRepository.create({
      ...createUserDto,
      stellarAddress: stellarAddress,
    });

    await this.userRepository.save(user);

    const { password, ...result } = user;

    return { ...result, secret };
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getProfileById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    const { password, ...result } = user;
    return result;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
  }
}
