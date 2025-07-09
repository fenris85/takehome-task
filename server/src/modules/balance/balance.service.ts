import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createPublicClient, erc20Abi, formatUnits, Address } from 'viem';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    private readonly blockchainService: BlockchainService,
  ) {}

  async getGasBalance(address?: string): Promise<string> {
    try {
      const targetAddress = address || this.blockchainService.getUserAddress();
      const viemClient = this.blockchainService.getViemClient();
      
      const balance = await viemClient.getBalance({
        address: targetAddress as Address,
      });

      const formattedBalance = formatUnits(balance, 18);
      this.logger.debug(`Gas balance for ${targetAddress}: ${formattedBalance} HYPE`);
      
      return formattedBalance;
    } catch (error) {
      this.logger.error('Failed to get gas balance', error);
      throw error;
    }
  }

  async getUsdt0Balance(address?: string): Promise<string> {
    try {
      const targetAddress = address || this.blockchainService.getUserAddress();
      const viemClient = this.blockchainService.getViemClient();
      const usdt0Address = this.blockchainService.getUsdt0Address();
      
      const balance = await viemClient.readContract({
        address: usdt0Address as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [targetAddress as Address],
      });

      // USDT0 typically has 6 decimals, but let's get it from the contract
      const decimals = await viemClient.readContract({
        address: usdt0Address as Address,
        abi: erc20Abi,
        functionName: 'decimals',
      });

      const formattedBalance = formatUnits(balance as bigint, decimals as number);
      this.logger.debug(`USDT0 balance for ${targetAddress}: ${formattedBalance} USDT0`);
      
      return formattedBalance;
    } catch (error) {
      this.logger.error('Failed to get USDT0 balance', error);
      throw error;
    }
  }
} 