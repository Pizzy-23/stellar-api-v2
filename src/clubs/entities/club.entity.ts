import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';

export enum DistributionType {
  EQUAL = 'EQUAL',
  PROPORTIONAL = 'PROPORTIONAL',
}

@Entity()
export class Club {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  usdcPool: number;

  @ManyToOne(() => User)
  creator: User;

  @ManyToMany(() => User, (user) => user.clubs)
  members: User[];

  @OneToMany(() => Activity, (activity) => activity.club)
  activities: Activity[];

  @Column({
    type: 'enum',
    enum: DistributionType,
    default: DistributionType.PROPORTIONAL,
  })
  distributionType: DistributionType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
