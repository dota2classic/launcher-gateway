import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { PartyInviteCreatedEvent } from '../../gateway/events/party/party-invite-created.event';
import { LauncherDeliver } from '../../socket/launcher.deliver';
import { Messages, PartyInviteReceivedMessage } from '../../socket/messages';
import { GetUserInfoQuery } from '../../gateway/queries/GetUserInfo/get-user-info.query';
import { GetUserInfoQueryResult } from '../../gateway/queries/GetUserInfo/get-user-info-query.result';

@EventsHandler(PartyInviteCreatedEvent)
export class PartyInviteCreatedHandler
  implements IEventHandler<PartyInviteCreatedEvent> {
  constructor(
    private readonly deliver: LauncherDeliver,
    private readonly queryBus: QueryBus,
  ) {}

  async handle(event: PartyInviteCreatedEvent) {
    const res = await this.queryBus.execute<
      GetUserInfoQuery,
      GetUserInfoQueryResult
    >(new GetUserInfoQuery(event.leaderId));

    this.deliver.deliver(
      event.invited,
      Messages.PARTY_INVITE_RECEIVED,
      new PartyInviteReceivedMessage(event.partyId, res.name, event.id),
    );
  }
}
