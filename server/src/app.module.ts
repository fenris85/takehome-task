import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './modules/entities';
import { appConfig } from './config/app.config';
import { BalanceModule } from './modules/balance/balance.module';
import { TransferModule } from './modules/transfer/transfer.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite' as any,
        database: configService.get<string>('DATABASE_URL', 'db.sqlite'),
        entities,
        logging: configService.get<string>('NODE_ENV') === 'development' ? ['query'] : false,
        synchronize: configService.get<boolean>('DATABASE_SYNC', false),
      }),
    }),
    BlockchainModule,
    BalanceModule,
    TransferModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
