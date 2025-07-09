import { Controller, Get, Param, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { AddressDto } from './dto/balance.dto';

@Controller('v1/balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get('hype/:address')
  async getHypeBalance(@Param(ValidationPipe) params: AddressDto) {
    try {
      const balance = await this.balanceService.getGasBalance(params.address);
      return {
        success: true,
        data: {
          address: params.address,
          balance,
          symbol: 'HYPE',
          decimals: 18,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch HYPE balance',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('usdt0/:address')
  async getUsdt0Balance(@Param(ValidationPipe) params: AddressDto) {
    try {
      const balance = await this.balanceService.getUsdt0Balance(params.address);
      return {
        success: true,
        data: {
          address: params.address,
          balance,
          symbol: 'USDT0',
          decimals: 6,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch USDT0 balance',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Legacy endpoint for backwards compatibility
  @Get()
  async getGasBalance() {
    try {
      const balance = await this.balanceService.getGasBalance();
      return {
        success: true,
        data: { balance },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch gas balance',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 