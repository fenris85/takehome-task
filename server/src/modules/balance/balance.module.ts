import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    BlockchainModule,
  ],
  controllers: [BalanceController],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {} 