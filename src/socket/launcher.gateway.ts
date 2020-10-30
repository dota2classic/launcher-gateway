import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EnterQueue, Messages, ReadyCheck } from './messages';
import { steam64to32 } from '../util/steamIds';
import { MatchmakingModes } from '../gateway/shared-types/matchmaking-mode';
import { QueueRepository } from '../launcher-gateway/repository/queue.repository';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { PlayerEnterQueueCommand } from '../gateway/commands/player-enter-queue.command';
import { PlayerId } from '../gateway/shared-types/player-id';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PlayerLeaveQueueCommand } from '../gateway/commands/player-leave-queue.command';
import { ReadyState, ReadyStateReceivedEvent } from '../gateway/events/ready-state-received.event';
import { GetUserRoomQuery } from '../gateway/queries/GetUserRoom/get-user-room.query';
import { GetUserRoomQueryResult } from '../gateway/queries/GetUserRoom/get-user-room-query.result';
import { GetSessionByUserQuery } from '../gateway/queries/GetSessionByUser/get-session-by-user.query';
import { GetSessionByUserQueryResult } from '../gateway/queries/GetSessionByUser/get-session-by-user-query.result';
import * as jwt_decode from "jwt-decode";

export interface LauncherSocket extends Socket {
  steam_id: string;
}

@WebSocketGateway()
export class LauncherGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly qRep: QueueRepository,
    private readonly ebus: EventBus,
    private readonly qbus: QueryBus,
    @Inject('QueryCore') private readonly redis: ClientProxy,
  ) {}


  @SubscribeMessage(Messages.AUTH)
  async onAuth(
    @MessageBody() data: string,
    @ConnectedSocket() client: LauncherSocket,
  ) {
    client.steam_id = steam64to32(data);

    MatchmakingModes.map(t => {
      client.emit(Messages.QUEUE_UPDATE, {
        mode: t,
        inQueue: this.qRep.get(t).inQueue,
      });
    });

    // this thing is for "ready check state"
    const roomState = await this.qbus.execute<
      GetUserRoomQuery,
      GetUserRoomQueryResult
      >(new GetUserRoomQuery(new PlayerId(client.steam_id)));
    client.emit(Messages.ROOM_STATE, roomState?.info);


    // this thing is for "current match"
    const matchState = await this.qbus.execute<
      GetSessionByUserQuery,
      GetSessionByUserQueryResult
      >(new GetSessionByUserQuery(new PlayerId(client.steam_id)));
    client.emit(Messages.MATCH_STATE, matchState?.serverUrl);


  }


  @SubscribeMessage(Messages.BROWSER_AUTH)
  async onBrowserAuth(
    @MessageBody() data: string,
    @ConnectedSocket() client: LauncherSocket,
  ) {

    const parsed = jwt_decode(data);

    // data = token
    client.steam_id = parsed.sub;

    MatchmakingModes.map(t => {
      client.emit(Messages.QUEUE_UPDATE, {
        mode: t,
        inQueue: this.qRep.get(t).inQueue,
      });
    });

    // this thing is for "ready check state"
    const roomState = await this.qbus.execute<
      GetUserRoomQuery,
      GetUserRoomQueryResult
    >(new GetUserRoomQuery(new PlayerId(client.steam_id)));
    client.emit(Messages.ROOM_STATE, roomState?.info);


    // this thing is for "current match"
    const matchState = await this.qbus.execute<
      GetSessionByUserQuery,
      GetSessionByUserQueryResult
      >(new GetSessionByUserQuery(new PlayerId(client.steam_id)));
    client.emit(Messages.MATCH_STATE, matchState?.serverUrl);


  }

  @SubscribeMessage(Messages.ENTER_QUEUE)
  async onEnterQueue(
    @MessageBody() data: EnterQueue,
    @ConnectedSocket() client: LauncherSocket,
  ) {
    await this.redis
      .emit(
        PlayerEnterQueueCommand.name,
        new PlayerEnterQueueCommand(new PlayerId(client.steam_id), data.mode),
      )
      .toPromise();
  }

  @SubscribeMessage(Messages.LEAVE_ALL_QUEUES)
  async leaveAllQueues(@ConnectedSocket() client: LauncherSocket) {
    const cmds = MatchmakingModes.map(mode =>
      this.redis
        .emit(
          PlayerLeaveQueueCommand.name,
          new PlayerLeaveQueueCommand(new PlayerId(client.steam_id), mode),
        )
        .toPromise(),
    );
    await Promise.all(cmds);
  }

  @SubscribeMessage(Messages.SET_READY_CHECK)
  async acceptGame(
    @MessageBody() data: ReadyCheck,
    @ConnectedSocket() client: LauncherSocket,
  ) {
    this.ebus.publish(
      new ReadyStateReceivedEvent(
        new PlayerId(client.steam_id),
        data.roomID,
        data.accept ? ReadyState.READY : ReadyState.DECLINE,
      ),
    );
  }

  async handleDisconnect(client: any) {
    const cmds = MatchmakingModes.map(mode =>
      this.redis
        .emit(
          PlayerLeaveQueueCommand.name,
          new PlayerLeaveQueueCommand(new PlayerId(client.steam_id), mode),
        )
        .toPromise(),
    );
    await Promise.all(cmds);
  }
}
