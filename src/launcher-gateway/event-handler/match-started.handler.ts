import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MatchStartedEvent } from '../../gateway/events/match-started.event';
import { Messages } from '../../socket/messages';
import { LauncherDeliver } from '../../socket/launcher.deliver';

@EventsHandler(MatchStartedEvent)
export class MatchStartedHandler implements IEventHandler<MatchStartedEvent> {
  constructor(private readonly deliver: LauncherDeliver) {}

  async handle(event: MatchStartedEvent) {
    const players = [...event.info.radiant].concat(event.info.dire);

    await new Promise(r => setTimeout(r, 5000));

    await this.deliver.deliver(players, Messages.SERVER_STARTED, {
      info: event.info,
      url: event.gsInfo.url,
    });
  }
}
