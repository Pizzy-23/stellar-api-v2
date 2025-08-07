import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { UsersModule } from '../users/users.module';
import { StellarModule } from '../stellar/stellar.module';
import { ActivitiesController } from './activities.controller';

@Module({
  imports: [
    UsersModule,
    StellarModule, 
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}