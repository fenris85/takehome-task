import { Controller, Get, Param, Query, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { AddressDto, TransferHistoryDto } from './dto/transfer.dto';
import { BlockchainService } from '../blockchain/blockchain.service';

@Controller('v1')
export class TransferController {
  constructor(
    private readonly transferService: TransferService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get('transfers/:address')
  async getTransferHistory(
    @Param(ValidationPipe) params: AddressDto,
    @Query(ValidationPipe) query: TransferHistoryDto,
  ) {
    try {
      const page = parseInt(query.page || '1', 10);
      const limit = parseInt(query.limit || '50', 10);

      const result = await this.transferService.getUsdt0Transfers(params.address, page, limit);
      
      return {
        success: true,
        data: {
          address: params.address,
          transfers: result.transfers,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / result.limit),
          },
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch transfer history',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/index-transfers/:address')
  async indexTransfers(
    @Param(ValidationPipe) params: AddressDto,
    @Query('fromBlock') fromBlock?: string,
    @Query('toBlock') toBlock?: string,
  ) {
    try {
      const fromBlockBigInt = fromBlock ? BigInt(fromBlock) : undefined;
      const toBlockBigInt = toBlock ? BigInt(toBlock) : undefined;

      const logs = await this.transferService.indexTransfersForRange(
        fromBlockBigInt || 0n,
        toBlockBigInt || await this.blockchainService.getCurrentBlockNumber(),
        params.address,
      );

      return {
        success: true,
        data: {
          message: 'Transfer indexing completed',
          address: params.address,
          fromBlock: fromBlockBigInt?.toString() || 'genesis',
          toBlock: toBlockBigInt?.toString() || 'latest',
          indexedCount: logs.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to index transfers',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 