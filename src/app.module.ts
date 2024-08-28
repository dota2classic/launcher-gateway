import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JWT_SECRET, REDIS_HOST, REDIS_PASSWORD } from './config/env';
import { GatewayProviders } from './launcher-gateway';
import { GatewayController } from './gateway.controller';
import { LauncherDeliver } from './socket/launcher.deliver';
import { GatewayService } from './gateway.service';
import { AuthGateway } from './socket/gateway/auth.gateway';
import { QueueGateway } from './socket/gateway/queue.gateway';
import { PartyGateway } from './socket/gateway/party.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // SentryModule.forRoot({
    //   dsn:
    //     "https://d0b5e989af4848cf963117815f5a129a@o435989.ingest.sentry.io/5530377",
    //   debug: false,
    //   environment: isDev ? "dev" : "production",
    //   logLevel: 2, //based on sentry.io loglevel //
    // }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '10 days' },
    }),
    ScheduleModule.forRoot(),
    CqrsModule,
    ClientsModule.register([
      {
        name: 'QueryCore',
        transport: Transport.REDIS,
        options: {
          host: REDIS_HOST(),
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
