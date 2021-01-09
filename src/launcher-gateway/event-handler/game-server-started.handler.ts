import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GameServerStartedEvent } from '../../gateway/events/game-server-started.event';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { Messages } from '../../socket/messages';

@EventsHandler(GameServerStartedEvent)
export class GameServerStartedHandler
  implements IEventHandler<GameServerStartedEvent> {
  constructor(private readonly deliver: LauncherDeliver) {}

  async handle(event: GameServerStartedEvent) {
    const players = [...event.info.radiant].concat(event.info.dire);

    await new Promise(r => setTimeout(r, 5000));

    await this.deliver.deliver(players, Messages.SERVER_STARTED, {
      info: event.info,
      url: event.url,
    });
  }
}
