import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MONITORING_SERVICE', 
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'], 
          queue: 'monitoring_queue', 
          queueOptions: {
            durable: true, 
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule], 
})
export class RabbitmqModule {}