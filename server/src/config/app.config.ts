import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsBoolean, IsOptional, IsUrl, Matches } from 'class-validator';

export class AppConfig {
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number = 8080;

  @IsString()
  NODE_ENV: string = 'development';

  @IsString()
  @IsUrl({ require_tld: false })
  RPC_URL: string;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  USDT0_ADDRESS: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  USDT0_INIT_BLOCK: bigint;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  USER_ADDRESS: string;

  @IsString()
  DATABASE_URL: string = 'db/db.sqlite';

  @IsString()
  DATABASE_TYPE: string = 'sqlite';

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  DATABASE_SYNC: boolean = false;

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = 'info';

  @IsString()
  @IsOptional()
  CORS_ORIGINS: string = 'http://localhost:3000';
}

export const appConfig = (): AppConfig => {
  const config = new AppConfig();
  
  // Load from environment variables
  config.PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
  config.NODE_ENV = process.env.NODE_ENV || 'development';
  config.RPC_URL = process.env.RPC_URL || '';
  config.USDT0_ADDRESS = process.env.USDT0_ADDRESS || '0xaa480c5f5eb436d0645189ca20e5ade13aecaf27';
  config.USDT0_INIT_BLOCK = BigInt(process.env.USDT0_INIT_BLOCK || 5350082);
  config.USER_ADDRESS = process.env.USER_ADDRESS || '0xde7D4ca820d141d655420D959AfFa3920bb1E07A';
  config.DATABASE_URL = process.env.DATABASE_URL || 'db/db.sqlite';
  config.DATABASE_TYPE = process.env.DATABASE_TYPE || 'sqlite';
  config.DATABASE_SYNC = process.env.DATABASE_SYNC === 'true' || process.env.NODE_ENV === 'development';
  config.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
  config.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:3000';

  return config;
}; 