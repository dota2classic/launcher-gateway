import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GameResultsEvent } from '../../gateway/events/gs/game-results.event';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { Messages } from '../../socket/messages';
import { PlayerId } from '../../gateway/shared-types/player-id';

@EventsHandler(GameResultsEvent)
export class GameResultsHandler implements IEventHandler<GameResultsEvent> {
  constructor(
    private readonly deliver: LauncherDeliver
  ) {}

  async handle(event: GameResultsEvent) {
    const players = event.players.map(t => new PlayerId(t.steam_id));

    await this.deliver.broadcast(players, () => ([ Messages.MATCH_RESULTS_READY, {
      url: event.server
    }]));
  }
}
