import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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
import { BrowserSocketAuth, Messages } from '../messages';
import { MatchmakingModes } from '../../gateway/shared-types/matchmaking-mode';
import { GetUserRoomQuery } from '../../gateway/queries/GetUserRoom/get-user-room.query';
import { GetUserRoomQueryResult } from '../../gateway/queries/GetUserRoom/get-user-room-query.result';
import { PlayerId } from '../../gateway/shared-types/player-id';
import { GetSessionByUserQuery } from '../../gateway/queries/GetSessionByUser/get-session-by-user.query';
import { GetSessionByUserQueryResult } from '../../gateway/queries/GetSessionByUser/get-session-by-user-query.result';
import fetch from 'node-fetch';
import { PlayerLeaveQueueCommand } from '../../gateway/commands/player-leave-queue.command';
import { LauncherSocket } from '../launcher.deliver';
import { RECAPTCHA_TOKEN } from '../../config/env';
import { JwtService } from '@nestjs/jwt';
import { Dota2Version } from '../../gateway/shared-types/dota2version';
import { QueueReadModel } from '../../launcher-gateway/model/queue.read-model';
import Timer = NodeJS.Timer;

@WebSocketGateway()
export class AuthGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private disconnectConsiderLeaver: {
    [key: string]: Timer;
  } = {};

  constructor(
    private readonly qRep: QueueRepository,
    private readonly ebus: EventBus,
    private readonly qbus: QueryBus,
    private readonly jwtService: JwtService,
    @Inject('QueryCore') private readonly redis: ClientProxy,
  ) {}

  handleConnection(client: LauncherSocket, ...args): any {
    console.log("niggers")
    setTimeout(() => {
      // 5 secs no token = drop
      if (!client.playerId) {
        client.disconnect();
      }
    }, 5000);
  }

  @SubscribeMessage(Messages.BROWSER_AUTH)
  async onBrowserAuth(
    @MessageBody() data: BrowserSocketAuth,
    @ConnectedSocket() client: LauncherSocket,
  ) {
    try {
      const parsed = this.jwtService.verify<{ sub: string }>(data.token);

      // data = token
      client.steam_id = parsed.sub;
      client.playerId = new PlayerId(client.steam_id);

      await this.onClientAuthenticated(client);
    } catch (e) {
      client.emit(Messages.BAD_AUTH)
      client.disconnect();
    }
  }

  private async verifyRecaptcha(reToken: string) {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_TOKEN}&response=${reToken}`;

    try {
      const res = await fetch(url, {
        method: 'post',
      }).then(response => response.json());
      return res.success && res.action === 'socketconnect';
    } catch (e) {
      return false;
    }
  }

  async handleDisconnect(client: LauncherSocket) {
    // here on disconnect we start timer

    const totalConnections = Object.values(
      this.server.sockets.connected,
    ).filter(
      (it: LauncherSocket) => it.steam_id === client.steam_id,
    ) as LauncherSocket[];

    if (totalConnections.length === 0)
      return this.startDisconnectCountdown(client);
  }

  private async stopDisconnectCountdown(client: LauncherSocket) {
    const existingTimer = this.disconnectConsiderLeaver[client.steam_id];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
  }

  private async disconnectAction(playerId: PlayerId) {
    const cmds = MatchmakingModes.flatMap(mode => [
      this.redis
        .emit(
          PlayerLeaveQueueCommand.name,
          new PlayerLeaveQueueCommand(playerId, mode, Dota2Version.Dota_681),
        )
        .toPromise(),
      this.redis
        .emit(
          PlayerLeaveQueueCommand.name,
          new PlayerLeaveQueueCommand(playerId, mode, Dota2Version.Dota_681),
        )
        .toPromise()
      ]
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
        version: Dota2Version.Dota_681,
        inQueue: this.qRep.get(QueueReadModel.id(t, Dota2Version.Dota_681)).inQueue,
      });

      client.emit(Messages.QUEUE_UPDATE, {
        mode: t,
        version: Dota2Version.Dota_684,
        inQueue: this.qRep.get(QueueReadModel.id(t, Dota2Version.Dota_684)).inQueue,
      });
    });

    client.emit(Messages.AUTH, { success: true });
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
