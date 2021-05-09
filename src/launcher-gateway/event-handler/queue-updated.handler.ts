import { EventBus, EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { QueueUpdatedEvent } from '../../gateway/events/queue-updated.event';
import { GetQueueStateQuery } from '../../gateway/queries/QueueState/get-queue-state.query';
import { GetQueueStateQueryResult } from '../../gateway/queries/QueueState/get-queue-state-query.result';
import { Messages } from '../../socket/messages';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { QueueRepository } from '../repository/queue.repository';
import { inspect } from 'util';
import { QueueReadModel } from '../model/queue.read-model';

@EventsHandler(QueueUpdatedEvent)
export class QueueUpdatedHandler implements IEventHandler<QueueUpdatedEvent> {
  constructor(
    private readonly ebus: EventBus,
    private readonly qbus: QueryBus,
    private readonly launcherDelivery: LauncherDeliver,
    private readonly qRep: QueueRepository,
  ) {}

  async handle(event: QueueUpdatedEvent) {
    try {
      const qs: GetQueueStateQueryResult = await this.qbus.execute(
        new GetQueueStateQuery(event.mode, event.version),
      );
      //
      const inQueue = qs.entries
        .map(t => t.players.length)
        .reduce((a, b) => a + b, 0);

      const q = await this.qRep.get(QueueReadModel.id(event.mode, event.version));
      q.inQueue = inQueue;
      await this.qRep.save(q.id, q);

      this.launcherDelivery.server.emit(Messages.QUEUE_UPDATE, {
        mode: event.mode,
        version: event.version,
        inQueue,
      });
    }catch (e){
      console.log(inspect(e))
    }
  }
}
