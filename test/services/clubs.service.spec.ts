import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ClubsService } from "src/clubs/clubs.service";
import { CreateClubDto } from "src/clubs/dto/create-club.dto";
import { Club, DistributionType } from "src/clubs/entities/club.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";

describe('ClubsService', () => {
  let service: ClubsService;
  let clubRepository: Repository<Club>;
  let userRepository: Repository<User>;

  const mockUserRepo = {
    findOneBy: jest.fn(),
  };

  const mockClubRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const userId = 'user-uuid-creator';
  const otherUserId = 'user-uuid-member';
  const clubId = 'club-uuid-123';
  const mockUser = { id: userId, username: 'creator' } as User;
  const mockOtherUser = { id: otherUserId, username: 'member' } as User;
  let mockClub: Club;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClubsService,
        {
          provide: getRepositoryToken(Club),
          useValue: mockClubRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<ClubsService>(ClubsService);
    clubRepository = module.get<Repository<Club>>(getRepositoryToken(Club));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    mockClub = {
      id: clubId,
      name: 'Test Club',
      creator: mockUser,
      members: [mockUser],
    } as Club;

    jest.spyOn(service, 'findOne').mockImplementation(async (id: string) => {
      if (id === clubId) {
        return mockClub;
      }
      throw new NotFoundException(`Club with ID ${id} not found.`);
    });

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a club', async () => {
      const createClubDto: CreateClubDto = {
        name: 'New Club',
        usdcPool: 100,
        distributionType: DistributionType.PROPORTIONAL,
      };

      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockClubRepo.create.mockReturnValue({ ...createClubDto, creator: mockUser, members: [mockUser] });
      mockClubRepo.save.mockResolvedValue({ id: clubId, ...createClubDto, creator: mockUser, members: [mockUser] });
      
      const result = await service.create(createClubDto, userId);
      
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockClubRepo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Club' }));
      expect(mockClubRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('New Club');
    });

    it('should throw NotFoundException if creator is not found', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);
      await expect(service.create({} as CreateClubDto, 'unknown-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a club if user is the creator', async () => {
      const updateDto = { name: 'Updated Club Name' };
      mockClubRepo.save.mockResolvedValue({ ...mockClub, ...updateDto });
      
      const result = await service.update(clubId, updateDto, userId);
      
      expect(mockClubRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Club Name' }));
      expect(result.name).toBe('Updated Club Name');
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      await expect(service.update(clubId, {}, otherUserId)).rejects.toThrow(ForbiddenException);
    });
  });
  
  describe('remove', () => {
    it('should remove a club if user is the creator', async () => {
      await service.remove(clubId, userId);
      expect(mockClubRepo.remove).toHaveBeenCalledWith(mockClub);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      await expect(service.remove(clubId, otherUserId)).rejects.toThrow(ForbiddenException);
      expect(mockClubRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe('joinClub', () => {
    it('should add a user to the members list and save', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockOtherUser);
      mockClubRepo.save.mockImplementation(club => Promise.resolve(club));

      const result = await service.joinClub(clubId, otherUserId);
      
      expect(result.members).toHaveLength(2);
      expect(result.members.some(m => m.id === otherUserId)).toBe(true);
      expect(mockClubRepo.save).toHaveBeenCalled();
    });

    it('should not add a user if they are already a member', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser); 
      
      const result = await service.joinClub(clubId, userId);

      expect(result.members).toHaveLength(1);
      expect(mockClubRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('leaveClub', () => {
    it('should remove a user from the members list and save', async () => {
      mockClub.members.push(mockOtherUser);
      expect(mockClub.members).toHaveLength(2);

      mockClubRepo.save.mockImplementation(club => Promise.resolve(club));

      const result = await service.leaveClub(clubId, otherUserId);

      expect(result.members).toHaveLength(1);
      expect(result.members.some(m => m.id === otherUserId)).toBe(false);
      expect(mockClubRepo.save).toHaveBeenCalled();
    });
  });
});