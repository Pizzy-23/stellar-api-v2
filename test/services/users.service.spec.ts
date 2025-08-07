import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Keypair } from 'stellar-sdk';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUserRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    preload: jest.fn(),
    softDelete: jest.fn(),
  };

  const userId = 'user-uuid-123';
  const mockUser = {
    id: userId,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashed_password',
    stellarAddress: 'G...',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user, generate a stellar keypair, and return user data with the secret', async () => {
      const createUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'hashed_password',
      };
      const createdUser = { ...createUserDto, id: 'new-uuid' };

      jest.spyOn(Keypair, 'random').mockReturnValue({
        publicKey: () => 'G_PUBLIC_KEY',
        secret: () => 'S_SECRET_KEY',
      } as any);

      mockUserRepo.create.mockReturnValue(createdUser);
      mockUserRepo.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stellarAddress: 'G_PUBLIC_KEY',
        }),
      );
      expect(mockUserRepo.save).toHaveBeenCalledWith(createdUser);
      expect(result).toHaveProperty('secret', 'S_SECRET_KEY');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('getProfileById', () => {
    it('should return a user profile without the password', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfileById(userId);

      expect(result.username).toEqual(mockUser.username);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfileById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the user profile', async () => {
      const updateDto = { username: 'updated_user' };
      const updatedUser = { ...mockUser, ...updateDto };

      mockUserRepo.preload.mockResolvedValue(updatedUser);
      mockUserRepo.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateDto);

      expect(mockUserRepo.preload).toHaveBeenCalledWith({
        id: userId,
        ...updateDto,
      });
      expect(mockUserRepo.save).toHaveBeenCalledWith(updatedUser);
      expect(result.username).toEqual('updated_user');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      mockUserRepo.preload.mockResolvedValue(null);
      await expect(service.update(userId, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should call softDelete on the repository with the correct id', async () => {
      mockUserRepo.softDelete.mockResolvedValue({ affected: 1 });
      await service.softDelete(userId);
      expect(mockUserRepo.softDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if no user was deleted', async () => {
      mockUserRepo.softDelete.mockResolvedValue({ affected: 0 });
      await expect(service.softDelete(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
