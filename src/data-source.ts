import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './users/entities/user.entity';
import { Activity } from './activities/entities/activity.entity';
import { Club } from './clubs/entities/club.entity';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  entities: [User, Activity, Club],
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
  ssl: {
    rejectUnauthorized: false,
  },
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
