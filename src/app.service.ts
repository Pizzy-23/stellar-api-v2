import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('MONITORING_SERVICE') private readonly client: ClientProxy,
  ) {}

  getHello(): string {
    const eventPayload = {
      userId: 'user-123',
      action: 'USER_REGISTERED',
      timestamp: new Date(),
    };

    this.client.emit('user_created', eventPayload);

    console.log('Evento user_created enviado para a fila!');

    return 'Hello World and event sent!';
  }
}