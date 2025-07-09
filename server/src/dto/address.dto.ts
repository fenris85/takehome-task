import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' })
  @Transform(({ value }) => value.toLowerCase())
  address: string;
}

export class TransferHistoryDto {
  @IsString()
  @IsOptional()
  page?: string = '1';

  @IsString()
  @IsOptional()
  limit?: string = '50';

  @IsString()
  @IsOptional()
  fromBlock?: string;

  @IsString()
  @IsOptional()
  toBlock?: string;
} 