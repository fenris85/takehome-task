import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user: string;

  @Column()
  amount: string;
}
