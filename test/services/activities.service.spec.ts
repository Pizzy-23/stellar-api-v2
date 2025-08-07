import { NotFoundException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivitiesService } from 'src/activities/activities.service';
import { StellarService } from 'src/stellar/stellar.service';
import { User } from 'src/users/entities/user.entity';

const mockUserRepository = {
  findOneBy: jest.fn(),
};

const mockStellarService = {
  mintKmTokens: jest.fn(),
};

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: StellarService,
          useValue: mockStellarService,
        },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processNewRun', () => {
    const userId = 'user-uuid-123';
    const logRunDto = { distanceKm: 5.5, durationSeconds: 1800 };
    const mockUser = {
      id: userId,
      username: 'testuser',
      stellarAddress: 'GABC...',
    };
    const mockTxResult = { hash: 'tx_hash_abc123' };

    it('should process a run and mint tokens successfully', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockStellarService.mintKmTokens.mockResolvedValue(mockTxResult);

      const result = await service.processNewRun(userId, logRunDto);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockStellarService.mintKmTokens).toHaveBeenCalledWith(
        mockUser.stellarAddress,
        5,
      );
      expect(result.tokensMinted).toBe(5);
      expect(result.transaction).toBe(mockTxResult.hash);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(service.processNewRun(userId, logRunDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user does not have a stellar address', async () => {
      const userWithoutAddress = { ...mockUser, stellarAddress: null };
      mockUserRepository.findOneBy.mockResolvedValue(userWithoutAddress);

      await expect(service.processNewRun(userId, logRunDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return a message and not mint tokens if distance is too short', async () => {
      const shortRunDto = { distanceKm: 0.5, durationSeconds: 300 };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.processNewRun(userId, shortRunDto);

      expect(mockStellarService.mintKmTokens).not.toHaveBeenCalled();
      expect(result.message).toEqual('Distance too short to generate tokens.');
    });
  });
});
