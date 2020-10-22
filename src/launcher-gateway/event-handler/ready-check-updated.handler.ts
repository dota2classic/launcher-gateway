import { ReadyStateUpdatedEvent } from '../../gateway/events/ready-state-updated.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { Messages } from '../../socket/messages';

@EventsHandler(ReadyStateUpdatedEvent)
export class ReadyStateUpdatedHandler
  implements IEventHandler<ReadyStateUpdatedEvent> {
  constructor(private readonly launcherDeliver: LauncherDeliver) {}

  async handle(event: ReadyStateUpdatedEvent) {
    this.launcherDeliver.server.emit(Messages.READY_CHECK_UPDATE, {
      roomID: event.roomID,
      mode: event.mode,
      total: event.state.total,
      accepted: event.state.accepted,
    });
  }
}
