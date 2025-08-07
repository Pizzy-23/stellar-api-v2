import dataSource from './data-source';

async function runMigrations() {
  console.log('Initializing data source...');
  await dataSource.initialize();
  console.log('Data source initialized.');

  console.log('Running migrations...');
  await dataSource.runMigrations();
  console.log('Migrations finished.');

  await dataSource.destroy();
  console.log('Data source destroyed.');
}

runMigrations().catch((error) => {
  console.error('Migration failed!', error);
  process.exit(1);
});