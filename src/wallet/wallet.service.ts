import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Horizon } from 'stellar-sdk';

@Injectable()
export class WalletService {
  private server: Horizon.Server;

  constructor(private configService: ConfigService) {
    const horizonUrl = this.configService.get<string>('HORIZON_URL');
    this.server = new Horizon.Server(horizonUrl);
  }
  async getAccountBalance(publicKey: string): Promise<Record<string, any>[]> {
    try {
      const account = await this.server.loadAccount(publicKey);

      return account.balances;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        throw new NotFoundException(
          `Stellar account ${publicKey} not found or not funded on the network.`,
        );
      }
      
      throw error;
    }
  }
}
