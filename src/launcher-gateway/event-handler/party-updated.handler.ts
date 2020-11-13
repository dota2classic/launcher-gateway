import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PartyUpdatedEvent } from '../../gateway/events/party/party-updated.event';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { Messages } from '../../socket/messages';

@EventsHandler(PartyUpdatedEvent)
export class PartyUpdatedHandler implements IEventHandler<PartyUpdatedEvent> {
  constructor(private readonly deliver: LauncherDeliver) {}

  async handle(event: PartyUpdatedEvent) {
    event.players.forEach(t => {
      const s = this.deliver.find(t);
      if (s) {
        s.emit(Messages.PARTY_UPDATED);
      }
    });
  }
}
