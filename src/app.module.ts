import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { isDev, REDIS_PASSWORD, REDIS_URL } from './config/env';
import { GatewayProviders } from './launcher-gateway';
import { GatewayController } from './gateway.controller';
import { LauncherDeliver } from './socket/launcher.deliver';
import { GatewayService } from './gateway.service';
import { AuthGateway } from './socket/gateway/auth.gateway';
import { QueueGateway } from './socket/gateway/queue.gateway';
import { PartyGateway } from './socket/gateway/party.gateway';
import { SentryModule } from '@ntegral/nestjs-sentry';

@Module({
  imports: [
    SentryModule.forRoot({
      dsn:
        "https://d0b5e989af4848cf963117815f5a129a@o435989.ingest.sentry.io/5530377",
      debug: false,
      environment: isDev ? "dev" : "production",
      logLevel: 2, //based on sentry.io loglevel //
    }),
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
