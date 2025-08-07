import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Club } from '../../clubs/entities/club.entity';
import { Activity } from '../../activities/entities/activity.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column({ nullable: true })
  stellarAddress: string;

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];

  @ManyToMany(() => Club, (club) => club.members)
  @JoinTable()
  clubs: Club[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
