import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MatchFinishedEvent } from '../../gateway/events/match-finished.event';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { Messages } from '../../socket/messages';

@EventsHandler(MatchFinishedEvent)
export class MatchFinishedHandler implements IEventHandler<MatchFinishedEvent> {
  constructor(private readonly deliver: LauncherDeliver) {}

  async handle(event: MatchFinishedEvent) {
    const players = event.info.players.map(it => it.playerId);

    this.deliver.deliver(players, Messages.MATCH_FINISHED, {
      roomId: event.info.roomId,
    });
  }
}
