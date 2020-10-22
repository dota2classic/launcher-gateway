import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { REDIS_URL } from './config/env';
import { LauncherGateway } from './socket/launcher.gateway';
import { GatewayProviders } from './launcher-gateway';
import { GatewayController } from './gateway.controller';
import { LauncherDeliver } from './socket/launcher.deliver';

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: 'QueryCore',
        transport: Transport.REDIS,
        options: {
          url: REDIS_URL(),
          retryAttempts: 10,
          retryDelay: 5000,
        },
      },
    ] as any),
  ],
  controllers: [GatewayController],
  providers: [
    ...GatewayProviders,
    LauncherGateway,
    LauncherDeliver
  ],
})
export class AppModule {}
