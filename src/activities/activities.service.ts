import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LogRunDto } from './dto/log-run.dto';
import { StellarService } from '../stellar/stellar.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);
  private readonly KM_TO_TOKEN_RATIO = 1;

  constructor(
    private readonly stellarService: StellarService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async processNewRun(userId: string, logRunDto: LogRunDto): Promise<any> {
    this.logger.log(`Fetching data for user ${userId}.`);

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (!user.stellarAddress) {
      throw new NotFoundException(
        `Stellar wallet for user ${userId} not configured.`,
      );
    }

    this.logger.log(
      `Received new run from user ${user.username}: ${logRunDto.distanceKm}km.`,
    );

    const tokensToMint = Math.floor(
      logRunDto.distanceKm * this.KM_TO_TOKEN_RATIO,
    );
    if (tokensToMint <= 0) {
      this.logger.warn(
        `Run distance for user ${userId} is too short. No tokens will be minted.`,
      );
      return { message: 'Distance too short to generate tokens.' };
    }

    this.logger.log(
      `Minting ${tokensToMint} KM Tokens for address ${user.stellarAddress}.`,
    );

    const transactionResult = await this.stellarService.mintKmTokens(
      user.stellarAddress,
      tokensToMint,
    );

    this.logger.log(
      `Minting completed. Transaction hash: ${transactionResult.hash}`,
    );

    return {
      message: 'Run logged and tokens minted successfully!',
      tokensMinted: tokensToMint,
      transaction: transactionResult.hash,
    };
  }
}
