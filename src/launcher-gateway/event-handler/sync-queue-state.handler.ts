import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { SyncQueueStateEvent } from '../event/sync-queue-state.event';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { GetUserQueueQuery } from '../../gateway/queries/GetUserQueue/get-user-queue.query';
import { GetUserQueueQueryResult } from '../../gateway/queries/GetUserQueue/get-user-queue-query.result';
import { Messages } from '../../socket/messages';

@EventsHandler(SyncQueueStateEvent)
export class SyncQueueStateHandler
  implements IEventHandler<SyncQueueStateEvent> {
  constructor(
    private readonly deliver: LauncherDeliver,
    private readonly qbus: QueryBus,
  ) {}

  async handle(event: SyncQueueStateEvent) {
    this.deliver.allConnected.map(async p => {
      const s = await this.qbus.execute<
        GetUserQueueQuery,
        GetUserQueueQueryResult
      >(new GetUserQueueQuery(p.playerId));

      this.deliver.deliver(p.playerId, Messages.QUEUE_STATE, s.mode);
    });
  }
}
