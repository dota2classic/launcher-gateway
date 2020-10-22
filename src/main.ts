import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { REDIS_URL } from './config/env';
import { Transport } from '@nestjs/microservices';
import { MatchmakingModes } from './gateway/shared-types/matchmaking-mode';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { QueueUpdatedEvent } from './gateway/events/queue-updated.event';
import { QueueRepository } from './launcher-gateway/repository/queue.repository';
import { QueueReadModel } from './launcher-gateway/model/queue.read-model';
import { inspect } from 'util';
import { Subscriber } from 'rxjs';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      url: REDIS_URL(),
      retryAttempts: 10,
      retryDelay: 5000,
    },
  });

  await app.startAllMicroservicesAsync();
  await app.listen(5010);

  const ebus = app.get(EventBus);
  const cbus = app.get(CommandBus);

  const clogger = new Logger('CommandLogger');
  const elogger = new Logger('EventLogger');

  ebus._subscribe(
    new Subscriber<any>(e => {
      elogger.log(`${inspect(e)}`);
    }),
  );

  cbus._subscribe(
    new Subscriber<any>(e => {
      clogger.log(
        `${inspect(e)}`,
        // e.__proto__.constructor.name,
      );
    }),
  );

  await Promise.all(
    MatchmakingModes.map(t =>
      app.get(QueueRepository).save(t, new QueueReadModel(t)),
    ),
  );

  MatchmakingModes.forEach(t => {
    app.get(EventBus).publish(new QueueUpdatedEvent(t));
  });
}
bootstrap();
