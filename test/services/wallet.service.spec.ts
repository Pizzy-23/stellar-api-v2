import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { WalletService } from 'src/wallet/wallet.service';

const mockLoadAccount = jest.fn();

jest.mock('stellar-sdk', () => ({
  ...jest.requireActual('stellar-sdk'),
  Horizon: {
    Server: jest.fn().mockImplementation(() => ({
      loadAccount: mockLoadAccount,
    })),
  },
}));

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockReturnValue('https://horizon-testnet.stellar.org'),
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAccountBalance', () => {
    const publicKey = 'GDCJ2L25A35T325T235T235T235T235T235T235T235T235T235T23';

    it('should return balances for a valid account', async () => {
      const mockBalances = [
        { balance: '1000.0000000', asset_type: 'native' },
        {
          balance: '50.0000000',
          asset_type: 'credit_alphanum4',
          asset_code: 'USDC',
          asset_issuer:
            'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
        },
      ];
      const mockAccount = { balances: mockBalances };
      mockLoadAccount.mockResolvedValue(mockAccount);

      const result = await service.getAccountBalance(publicKey);

      expect(mockLoadAccount).toHaveBeenCalledWith(publicKey);
      expect(result).toEqual(mockBalances);
    });

    it('should throw NotFoundException for a 404 error from Horizon', async () => {
      const notFoundError = {
        response: {
          status: 404,
        },
      };
      mockLoadAccount.mockRejectedValue(notFoundError);

      await expect(service.getAccountBalance(publicKey)).rejects.toThrow(
        new NotFoundException(
          `Stellar account ${publicKey} not found or not funded on the network.`,
        ),
      );
      expect(mockLoadAccount).toHaveBeenCalledWith(publicKey);
    });

    it('should re-throw other non-404 errors', async () => {
      const genericError = new Error('Internal Server Error');
      (genericError as any).response = { status: 500 };
      mockLoadAccount.mockRejectedValue(genericError);

      await expect(service.getAccountBalance(publicKey)).rejects.toThrow(
        genericError,
      );
      expect(mockLoadAccount).toHaveBeenCalledWith(publicKey);
    });
  });
});
