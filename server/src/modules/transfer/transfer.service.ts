import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { erc20Abi, formatUnits, Address } from 'viem';
import { Transfer } from './transfer.entity';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(
    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async indexUsdt0Transfers(fromBlock?: bigint, toBlock?: bigint, userAddress?: string) {
    try {
      const targetAddress = userAddress || this.blockchainService.getUserAddress();
      const viemClient = this.blockchainService.getViemClient();
      const usdt0Address = this.blockchainService.getUsdt0Address();
      const usdt0InitBlock = this.blockchainService.getUsdt0InitBlock();
      
      this.logger.log(`Starting USDT0 transfer indexing for ${targetAddress}...`);

      const transferEvent = erc20Abi.find(
        (abi) => abi.type === 'event' && abi.name === 'Transfer',
      )!;
      
      const startBlock = fromBlock || usdt0InitBlock;
      const endBlock = toBlock || (await viemClient.getBlockNumber());
      const maxRange = 1000n;

      this.logger.log(`Fetching transfers from block ${startBlock} to ${endBlock}`);

      const allLogs: any[] = [];
      
      // Fetch all transfers and filter for user's incoming/outgoing
      this.logger.debug(`Fetching all transfers...`);
      console.log('startBlock', startBlock);
      for (let currentBlockRange = startBlock; currentBlockRange <= endBlock; currentBlockRange += maxRange) {
        const toBlockChunk = currentBlockRange + maxRange - 1n > endBlock ? endBlock : currentBlockRange + maxRange - 1n;
        
        console.log('toBlockChunk', toBlockChunk);
        console.log('currentBlockRange', currentBlockRange);
        try {
          // Fetch all Transfer events for this contract in the block range
          const allTransferLogs = await viemClient.getLogs({
            address: usdt0Address as Address,
            event: transferEvent,
            fromBlock: currentBlockRange,
            toBlock: toBlockChunk,
          });
          
          // Filter for transfers involving the target address (both incoming and outgoing)
          const userTransferLogs = allTransferLogs.filter((log: any) => {
            const from = log.args?.from?.toLowerCase();
            const to = log.args?.to?.toLowerCase();
            const target = targetAddress.toLowerCase();
            return from === target || to === target;
          });
          
          allLogs.push(...(userTransferLogs as any[]));
          
        } catch (chunkError) {
          this.logger.warn(`Failed to fetch logs for block range ${currentBlockRange}-${toBlockChunk}:`, chunkError.message);
        }
      }

      // Remove duplicates and sort by block number
      const uniqueLogs = allLogs.filter((log, index, self) => 
        index === self.findIndex(l => l.transactionHash === log.transactionHash && l.logIndex === log.logIndex)
      ).sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

      this.logger.log(`Found ${uniqueLogs.length} unique transfer logs`);

      // Save transfers to database
      if (uniqueLogs.length > 0) {
        await this.saveTransfersToDatabase(uniqueLogs);
      }

      return uniqueLogs;
    } catch (error) {
      this.logger.error('Failed to index USDT0 transfers', error.stack || error.message);
      throw new Error(`Transfer indexing failed: ${error.message}`);
    }
  }

  private async saveTransfersToDatabase(logs: any[]): Promise<void> {
    try {
      this.logger.log(`Saving ${logs.length} transfers to database...`);

      const viemClient = this.blockchainService.getViemClient();
      const usdt0Address = this.blockchainService.getUsdt0Address();

      // Get USDT0 decimals from contract
      const decimals = await viemClient.readContract({
        address: usdt0Address as Address,
        abi: erc20Abi,
        functionName: 'decimals',
      });

      const transferEntities = logs.map((log: any) => {
        const transfer = new Transfer();
        transfer.transactionHash = log.transactionHash;
        transfer.blockNumber = log.blockNumber.toString();
        transfer.fromAddress = log.args?.from?.toLowerCase() || '';
        transfer.toAddress = log.args?.to?.toLowerCase() || '';
        transfer.value = log.args?.value?.toString() || '0';
        transfer.tokenAddress = usdt0Address.toLowerCase();
        transfer.decimals = decimals as number;
        transfer.symbol = 'USDT0';
        
        // Estimate block timestamp (this is rough, could be improved with actual block data)
        transfer.blockTimestamp = new Date(Date.now() - (Number(log.blockNumber) * 1000));
        
        return transfer;
      });

      // Use upsert to handle duplicates gracefully
      await this.transferRepository.upsert(transferEntities, {
        conflictPaths: ['transactionHash'],
        skipUpdateIfNoValuesChanged: true,
      });

      this.logger.log(`Successfully saved ${transferEntities.length} transfers to database`);
    } catch (error) {
      this.logger.error('Failed to save transfers to database', error.stack || error.message);
      throw error;
    }
  }

  async getUsdt0Transfers(address?: string, page: number = 1, limit: number = 50) {
    try {
      const targetAddress = (address || this.blockchainService.getUserAddress()).toLowerCase();
      const usdt0Address = this.blockchainService.getUsdt0Address();
      
      this.logger.log(`Getting USDT0 transfers for ${targetAddress} from database`);
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Fetch transfers from database
      const [transfers, total] = await this.transferRepository.findAndCount({
        where: [
          { fromAddress: targetAddress, tokenAddress: usdt0Address.toLowerCase() },
          { toAddress: targetAddress, tokenAddress: usdt0Address.toLowerCase() },
        ],
        order: { blockNumber: 'DESC', id: 'DESC' },
        take: limit,
        skip: offset,
      });

      if (transfers.length === 0) {
        this.logger.log(`No transfers found in database for ${targetAddress}, attempting to index...`);
        
        // Try to index recent transfers if none found in database
        await this.indexUsdt0Transfers(7800838n, 7800839n, targetAddress);
        
        // Try fetching again after indexing
        const [newTransfers, newTotal] = await this.transferRepository.findAndCount({
          where: [
            { fromAddress: targetAddress, tokenAddress: usdt0Address.toLowerCase() },
            { toAddress: targetAddress, tokenAddress: usdt0Address.toLowerCase() },
          ],
          order: { blockNumber: 'DESC', id: 'DESC' },
          take: limit,
          skip: offset,
        });

        return {
          transfers: newTransfers.map(this.formatTransferResponse),
          total: newTotal,
          page,
          limit,
        };
      }

      return {
        transfers: transfers.map(this.formatTransferResponse),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Failed to get USDT0 transfers from database', error.stack || error.message);
      throw new Error(`Failed to fetch transfers: ${error.message}`);
    }
  }

  private formatTransferResponse(transfer: Transfer) {
    return {
      id: transfer.id,
      blockNumber: transfer.blockNumber,
      transactionHash: transfer.transactionHash,
      from: transfer.fromAddress,
      to: transfer.toAddress,
      value: formatUnits(BigInt(transfer.value), transfer.decimals),
      rawValue: transfer.value,
      tokenAddress: transfer.tokenAddress,
      symbol: transfer.symbol,
      decimals: transfer.decimals,
      timestamp: transfer.timestamp,
      blockTimestamp: transfer.blockTimestamp,
    };
  }

  // Method to manually trigger indexing for a specific block range
  async indexTransfersForRange(fromBlock: bigint, toBlock: bigint, address?: string) {
    return this.indexUsdt0Transfers(fromBlock, toBlock, address);
  }
} 