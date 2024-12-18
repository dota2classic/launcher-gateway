import {
  CommandBus,
  EventBus,
  EventsHandler,
  IEventHandler,
} from '@nestjs/cqrs';
import { ReadyCheckStartedEvent } from '../../gateway/events/ready-check-started.event';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { Messages } from '../../socket/messages';
import { RoomSizes } from '../../gateway/shared-types/matchmaking-mode';

@EventsHandler(ReadyCheckStartedEvent)
export class ReadyCheckStartedHandler
  implements IEventHandler<ReadyCheckStartedEvent> {
  constructor(
    private readonly cbus: CommandBus,
    private readonly ebus: EventBus,
    private readonly launcherDelivery: LauncherDeliver,
  ) {}

  async handle(event: ReadyCheckStartedEvent) {
    this.launcherDelivery.deliver(
      event.entries.map(z => z.playerId),
      Messages.GAME_FOUND,
      {
        mode: event.mode,
        total: RoomSizes[event.mode],
        accepted: 0,
        roomID: event.roomId,
        entries: event.entries.map(entry => ({
          steam_id: entry.playerId.value,
          state: entry.readyState,
        })),
      },
    );
  }
}
