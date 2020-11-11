import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { QueueRepository } from '../../launcher-gateway/repository/queue.repository';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Messages } from '../messages';
import { steam64to32 } from '../../util/steamIds';
import { MatchmakingModes } from '../../gateway/shared-types/matchmaking-mode';
import { GetUserRoomQuery } from '../../gateway/queries/GetUserRoom/get-user-room.query';
import { GetUserRoomQueryResult } from '../../gateway/queries/GetUserRoom/get-user-room-query.result';
import { PlayerId } from '../../gateway/shared-types/player-id';
import { GetSessionByUserQuery } from '../../gateway/queries/GetSessionByUser/get-session-by-user.query';
import { GetSessionByUserQueryResult } from '../../gateway/queries/GetSessionByUser/get-session-by-user-query.result';

import * as jwt_decode from 'jwt-decode';
import { PlayerLeaveQueueCommand } from '../../gateway/commands/player-leave-queue.command';
import Timer = NodeJS.Timer;
import { LauncherSocket } from '../launcher.deliver';

@WebSocketGateway()
export class AuthGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private disconnectConsiderLeaver: {
    [key: string]: Timer;
  } = {};

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
    client.playerId = new PlayerId(client.steam_id);

    await this.onClientAuthenticated(client);
  }

  @SubscribeMessage(Messages.BROWSER_AUTH)
  async onBrowserAuth(
    @MessageBody() data: string,
    @ConnectedSocket() client: LauncherSocket,
  ) {
    const parsed = jwt_decode(data);

    // data = token
    client.steam_id = parsed.sub;
    client.playerId = new PlayerId(client.steam_id);

    await this.onClientAuthenticated(client);
  }

  async handleDisconnect(client: LauncherSocket) {
    // here on disconnect we start timer
    return this.startDisconnectCountdown(client);
  }

  private async stopDisconnectCountdown(client: LauncherSocket) {
    const existingTimer = this.disconnectConsiderLeaver[client.steam_id];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
  }

  private async disconnectAction(playerId: PlayerId) {
    const cmds = MatchmakingModes.map(mode =>
      this.redis
        .emit(
          PlayerLeaveQueueCommand.name,
          new PlayerLeaveQueueCommand(playerId, mode),
        )
        .toPromise(),
    );
    return Promise.all(cmds);
  }

  private async startDisconnectCountdown(client: LauncherSocket) {
    const timer = setTimeout(() => {
      this.disconnectAction(client.playerId);
    }, 60_000);
    await this.stopDisconnectCountdown(client);
    this.disconnectConsiderLeaver[client.steam_id] = timer;
  }

  private async onClientAuthenticated(client: LauncherSocket) {
    // clear timeouts
    await this.stopDisconnectCountdown(client);

    MatchmakingModes.map(t => {
      client.emit(Messages.QUEUE_UPDATE, {
        mode: t,
        inQueue: this.qRep.get(t).inQueue,
      });
    });

    // this thing is for "ready check state"
    const roomState = await this.getRoomState(client.playerId);
    client.emit(Messages.ROOM_STATE, roomState?.info);

    // this thing is for "current match"
    const matchState = await this.getMatchState(client.playerId);
    client.emit(Messages.MATCH_STATE, matchState?.serverUrl);
  }

  private async getMatchState(playerId: PlayerId) {
    return this.qbus.execute<
      GetSessionByUserQuery,
      GetSessionByUserQueryResult
    >(new GetSessionByUserQuery(playerId));
  }

  private async getRoomState(playerId: PlayerId) {
    return await this.qbus.execute<GetUserRoomQuery, GetUserRoomQueryResult>(
      new GetUserRoomQuery(playerId),
    );
  }
}
