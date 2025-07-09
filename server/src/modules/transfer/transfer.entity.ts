import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('transfers')
@Index(['fromAddress', 'timestamp'])
@Index(['toAddress', 'timestamp'])
@Index(['transactionHash'], { unique: true })
@Index(['blockNumber'])
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 66 })
  transactionHash: string;

  @Column({ type: 'bigint' })
  blockNumber: string;

  @Column({ type: 'varchar', length: 42 })
  fromAddress: string;

  @Column({ type: 'varchar', length: 42 })
  toAddress: string;

  @Column({ type: 'varchar', length: 78 }) // To handle large token amounts
  value: string;

  @Column({ type: 'varchar', length: 42 })
  tokenAddress: string;

  @Column({ type: 'int', default: 18 })
  decimals: number;

  @Column({ type: 'varchar', length: 10, default: 'USDT0' })
  symbol: string;

  @Column({ type: 'bigint', nullable: true })
  gasUsed: string;

  @Column({ type: 'bigint', nullable: true })
  gasPrice: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'datetime', nullable: true })
  blockTimestamp: Date;
} 