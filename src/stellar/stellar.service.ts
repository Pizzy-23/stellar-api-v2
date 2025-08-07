import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Horizon,
  nativeToScVal,
} from 'stellar-sdk';

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private server: Horizon.Server;
  private networkPassphrase: string;
  private serviceKeypair: Keypair;

  constructor(private configService: ConfigService) {
    const horizonUrl = this.configService.get<string>('HORIZON_URL');
    this.server = new Horizon.Server(horizonUrl);

    this.networkPassphrase =
      this.configService.get<string>('NETWORK_PASSPHRASE') === 'TESTNET'
        ? Networks.TESTNET
        : Networks.PUBLIC;

    const serviceSecret = this.configService.get<string>(
      'SERVICE_ACCOUNT_SECRET',
    );
    this.serviceKeypair = Keypair.fromSecret(serviceSecret);
  }

  async mintKmTokens(
    userStellarAddress: string,
    amount: number,
  ): Promise<{ hash: string }> {
    const kmTokenContractId = this.configService.get<string>(
      'KM_TOKEN_CONTRACT_ID',
    );

    const sourceAccount = await this.server.loadAccount(
      this.serviceKeypair.publicKey(),
    );

    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100000',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: kmTokenContractId,
          function: 'mint',
          args: [
            nativeToScVal(userStellarAddress, { type: 'address' }),
            nativeToScVal(BigInt(amount), { type: 'i128' }),
          ],
        }),
      )
      .setTimeout(30)
      .build();

    tx.sign(this.serviceKeypair);

    try {
      const response = await this.server.submitTransaction(tx);
      this.logger.log(
        `Transação de mint submetida com sucesso: ${response.hash}`,
      );
      return { hash: response.hash };
    } catch (error) {
      this.logger.error(
        'Erro ao submeter transação de mint:',
        error.response?.data?.extras?.result_codes || error,
      );
      throw new Error('Falha ao mintar tokens KM na rede Stellar.');
    }
  }
}
