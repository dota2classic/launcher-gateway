import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { REDIS_PASSWORD, REDIS_URL } from './config/env';
import { GatewayProviders } from './launcher-gateway';
import { GatewayController } from './gateway.controller';
import { LauncherDeliver } from './socket/launcher.deliver';
import { GatewayService } from './gateway.service';
import { AuthGateway } from './socket/gateway/auth.gateway';
import { QueueGateway } from './socket/gateway/queue.gateway';
import { PartyGateway } from './socket/gateway/party.gateway';

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: 'QueryCore',
        transport: Transport.REDIS,
        options: {
          url: REDIS_URL(),
          password: REDIS_PASSWORD(),
          retryAttempts: Infinity,
          retryDelay: 5000,
        },
      },
    ] as any),
  ],
  controllers: [GatewayController],
  providers: [
    ...GatewayProviders,

    AuthGateway,
    QueueGateway,

    PartyGateway,


    LauncherDeliver,
    GatewayService
  ],
})
export class AppModule {}
