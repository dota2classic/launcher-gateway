import { EventBus, EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { QueueUpdatedEvent } from '../../gateway/events/queue-updated.event';
import { QueueStateQuery } from '../../gateway/queries/QueueState/queue-state.query';
import { QueueStateQueryResult } from '../../gateway/queries/QueueState/queue-state-query.result';
import { Messages } from '../../socket/messages';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { QueueRepository } from '../repository/queue.repository';

@EventsHandler(QueueUpdatedEvent)
export class QueueUpdatedHandler implements IEventHandler<QueueUpdatedEvent> {
  constructor(
    private readonly ebus: EventBus,
    private readonly qbus: QueryBus,
    private readonly launcherDelivery: LauncherDeliver,
    private readonly qRep: QueueRepository,
  ) {}

  async handle(event: QueueUpdatedEvent) {
    const qs: QueueStateQueryResult = await this.qbus.execute(
      new QueueStateQuery(event.mode),
    );

    const inQueue = qs.entries
      .map(t => t.players.length)
      .reduce((a, b) => a + b, 0);

    const q = await this.qRep.get(event.mode);
    q.inQueue = inQueue;
    await this.qRep.save(q.mode, q);

    this.launcherDelivery.server.emit(Messages.QUEUE_UPDATE, {
      mode: event.mode,
      inQueue,
    });
  }
}
