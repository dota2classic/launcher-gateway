import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { PartyInviteExpiredEvent } from '../../gateway/events/party/party-invite-expired.event';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { Messages } from '../../socket/messages';

@EventsHandler(PartyInviteExpiredEvent)
export class PartyInviteExpiredHandler
  implements IEventHandler<PartyInviteExpiredEvent> {
  constructor(
    private readonly deliver: LauncherDeliver,
    private readonly queryBus: QueryBus,
  ) {}

  async handle(event: PartyInviteExpiredEvent) {
    this.deliver
      .find(event.invited)
      ?.emit(Messages.PARTY_INVITE_EXPIRED, event.id);
  }
}
