import {
  ActivitiesModule,
  AuthModule,
  ClubsModule,
  RabbitmqModule,
  StellarModule,
  TypeOrmConfigService,
  UsersModule,
  WalletModule,
} from '.';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    AuthModule,
    UsersModule,
    ClubsModule,
    ActivitiesModule,
    WalletModule,
    StellarModule,
    RabbitmqModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
