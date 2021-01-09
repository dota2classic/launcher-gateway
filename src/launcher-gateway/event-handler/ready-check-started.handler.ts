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
    event.entries.forEach(t => {
      const socket = this.launcherDelivery.find(t.playerId);
      if (socket) {
        socket.emit(Messages.GAME_FOUND, {
          mode: event.mode,
          total: RoomSizes[event.mode],
          accepted: 0,
          roomID: event.roomId,
        });
      } else {
        console.log(`Didnt find socket with id ${t.playerId.value}`);
      }
    });
  }
}
