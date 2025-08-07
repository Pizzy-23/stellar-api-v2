import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Club } from '../../clubs/entities/club.entity';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.activities, { eager: true })
  user: User;

  @ManyToOne(() => Club, (club) => club.activities, { eager: true })
  club: Club;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
  })
  distanceKm: number;

  @Column({ type: 'integer' })
  durationSeconds: number;

  @CreateDateColumn()
  createdAt: Date;
}
