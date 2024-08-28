import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { REDIS_HOST, REDIS_PASSWORD } from './config/env';
import { Transport } from '@nestjs/microservices';
import { MatchmakingModes } from './gateway/shared-types/matchmaking-mode';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { QueueUpdatedEvent } from './gateway/events/queue-updated.event';
import { QueueRepository } from './launcher-gateway/repository/queue.repository';
import { QueueReadModel } from './launcher-gateway/model/queue.read-model';
import { inspect } from 'util';
import { Logger } from '@nestjs/common';
import { Dota2Version } from './gateway/shared-types/dota2version';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: REDIS_HOST(),
      retryAttempts: Infinity,
      password: REDIS_PASSWORD(),
      retryDelay: 5000,
    },
  });

  await app.startAllMicroservices();
  await app.listen(5010);
  //
  const ebus = app.get(EventBus);
  const cbus = app.get(CommandBus);
  const qbus = app.get(QueryBus);
  //
  const clogger = new Logger('CommandLogger');
  const elogger = new Logger('EventLogger');
  const qlogger = new Logger('QeuryLogger');
  //
ebus.subscribe(e => {
  elogger.log(`${inspect(e)}`);
});
  //
  cbus.subscribe(e => {
    clogger.log(
      `${inspect(e)}`,
      // e.__proto__.constructor.name,
    );
  })
  qbus.subscribe(
    e => {
      qlogger.log(
        `${inspect(e)}`,
        // e.__proto__.constructor.name,
      );
    }
  )
  //
  await Promise.all(
    MatchmakingModes.map(t => {
        app.get(QueueRepository).save(QueueReadModel.id(t, Dota2Version.Dota_681), new QueueReadModel(t, Dota2Version.Dota_681))
        app.get(QueueRepository).save(QueueReadModel.id(t, Dota2Version.Dota_684), new QueueReadModel(t, Dota2Version.Dota_684))
      }
    ),
  );
  //
  MatchmakingModes.forEach(t => {
    app.get(EventBus).publish(new QueueUpdatedEvent(t, Dota2Version.Dota_681));
    app.get(EventBus).publish(new QueueUpdatedEvent(t, Dota2Version.Dota_684));
  });

  // @ts-ignore
  console.log('Started gateway')
}
bootstrap();
