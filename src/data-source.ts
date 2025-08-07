// data-source.ts

import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './users/entities/user.entity';
import { Activity } from './activities/entities/activity.entity';
import { Club } from './clubs/entities/club.entity';

dotenv.config();

const isTestEnvironment = process.env.NODE_ENV === 'test';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: isTestEnvironment
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL,
  synchronize: isTestEnvironment,
  entities: [User, Activity, Club],
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',

  ssl: isTestEnvironment
    ? false
    : {
        rejectUnauthorized: false,
      },

  logging: !isTestEnvironment,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
