import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { QueueRepository } from '../../launcher-gateway/repository/queue.repository';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Messages, PartyInvite } from '../messages';
import { LauncherSocket } from '../launcher.deliver';
import { PartyInviteRequestedEvent } from '../../gateway/events/party/party-invite-requested.event';
import { PlayerId } from '../../gateway/shared-types/player-id';
import { PartyInviteAcceptedEvent } from '../../gateway/events/party/party-invite-accepted.event';
import { PartyLeaveRequestedEvent } from '../../gateway/events/party/party-leave-requested.event';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PartyGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly qRep: QueueRepository,
    private readonly ebus: EventBus,
    private readonly qbus: QueryBus,
    @Inject('QueryCore') private readonly redis: ClientProxy,
  ) {}

  @SubscribeMessage(Messages.INVITE_TO_PARTY)
  async inviteParty(
    @MessageBody() data: PartyInvite,
    @ConnectedSocket() client: LauncherSocket,
  ) {
    await this.redis
      .emit(
        PartyInviteRequestedEvent.name,
        new PartyInviteRequestedEvent(client.playerId, new PlayerId(data.id)),
      )
      .toPromise();
  }

  @SubscribeMessage(Messages.ACCEPT_PARTY_INVITE)
  async acceptPartyInvite(
    @MessageBody() data: { id: string; accept: boolean },
    @ConnectedSocket() client: LauncherSocket,
  ) {
    await this.redis
      .emit(
        PartyInviteAcceptedEvent.name,
        new PartyInviteAcceptedEvent(data.id, client.playerId, data.accept),
      )
      .toPromise();
  }


  @SubscribeMessage(Messages.LEAVE_PARTY)
  async leaveParty(
    @ConnectedSocket() client: LauncherSocket,
  ) {
    await this.redis
      .emit(
        PartyLeaveRequestedEvent.name,
        new PartyLeaveRequestedEvent(client.playerId),
      )
      .toPromise();
  }
}
