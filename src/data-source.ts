import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

function getDataSourceOptions(): DataSourceOptions {
  // Se existir DATABASE_URL no .env, usa ela
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
      entities: ['src/**/*.entity.ts'],
      migrations: ['src/migrations/*.ts'],
      migrationsTableName: 'migrations',
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'migrations',
  };
}

export const dataSourceOptions: DataSourceOptions = getDataSourceOptions();

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;