import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { QueueRepository } from '../../launcher-gateway/repository/queue.repository';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Messages, PartyInvite } from '../messages';
import { LauncherSocket } from '../launcher.deliver';
import { PartyInviteRequestedEvent } from '../../gateway/events/party/party-invite-requested.event';
import { PlayerId } from '../../gateway/shared-types/player-id';

@WebSocketGateway()
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
  async onEnterQueue(
    @MessageBody() data: PartyInvite,
    @ConnectedSocket() client: LauncherSocket,
  ) {
    await this.redis.emit(
      PartyInviteRequestedEvent.name,
      new PartyInviteRequestedEvent(client.playerId, new PlayerId(data.id)),
    ).toPromise();
  }
}
