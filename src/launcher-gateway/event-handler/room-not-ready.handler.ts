import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RoomNotReadyEvent } from '../../gateway/events/room-not-ready.event';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { Messages } from '../../socket/messages';

@EventsHandler(RoomNotReadyEvent)
export class RoomNotReadyHandler implements IEventHandler<RoomNotReadyEvent> {
  constructor(
    private readonly deliver: LauncherDeliver
  ) {}

  async handle(event: RoomNotReadyEvent) {
    const sockets = event.players.map(t => this.deliver.find(t))
    console.log(`Found total ${sockets.length} sockets`)
    const prms = sockets.map(it => {
      it?.emit(Messages.ROOM_NOT_READY, {
        roomID: event.roomId
      })
      this.deliver.updateQueue(it)
    });
    await Promise.all(prms)

  }
}
