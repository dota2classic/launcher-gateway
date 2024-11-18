import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { SyncQueueStateEvent } from '../event/sync-queue-state.event';
import { LauncherDeliver } from '../../socket/launcher.deliver';

@EventsHandler(SyncQueueStateEvent)
export class SyncQueueStateHandler
  implements IEventHandler<SyncQueueStateEvent> {
  constructor(
    private readonly deliver: LauncherDeliver,
    private readonly qbus: QueryBus,
  ) {}

  async handle(event: SyncQueueStateEvent) {
    await Promise.all(
      this.deliver.allConnected.map(p => this.deliver.updateQueue(p)),
    );
  }
}
