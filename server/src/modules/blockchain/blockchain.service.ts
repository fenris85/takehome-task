import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http } from 'viem';
import { createHyperEvmChain } from '../../utils/hyperevm';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly viemClient;
  private readonly usdt0Address: string;
  private readonly usdt0InitBlock: bigint;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    if (!rpcUrl) {
      throw new Error('RPC_URL environment variable is required');
    }

    this.usdt0Address = this.configService.get<string>('USDT0_ADDRESS')!;
    this.usdt0InitBlock = this.configService.get<bigint>('USDT0_INIT_BLOCK')!;

    const chain = createHyperEvmChain(rpcUrl);
    this.viemClient = createPublicClient({
      chain,
      transport: http(),
    });

    this.logger.log('BlockchainService initialized with configuration');
  }

  getViemClient() {
    return this.viemClient;
  }

  getUsdt0Address(): string {
    return this.usdt0Address;
  }

  getUsdt0InitBlock(): bigint {
    return this.usdt0InitBlock;
  }

  async getCurrentBlockNumber(): Promise<bigint> {
    return await this.viemClient.getBlockNumber();
  }
} 