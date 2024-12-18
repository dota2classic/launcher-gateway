import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayerId } from '../gateway/shared-types/player-id';
import { GetUserQueueQuery } from '../gateway/queries/GetUserQueue/get-user-queue.query';
import { GetUserQueueQueryResult } from '../gateway/queries/GetUserQueue/get-user-queue-query.result';
import { InactiveQueueStateMessage, InQueueStateMessage, Messages } from './messages';
import { QueryBus } from '@nestjs/cqrs';

export interface LauncherSocket extends Socket {
  steam_id: string;
  playerId: PlayerId;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LauncherDeliver {
  @WebSocketServer()
  public server: Server;



  constructor(private readonly qbus: QueryBus) {}


  public get allConnected(): LauncherSocket[]{
    return Array.from(this.server.sockets.sockets.values()).filter((t: LauncherSocket) => !!t.playerId) as LauncherSocket[]
  }

  public find(playerId: PlayerId): LauncherSocket | undefined {
    return Array.from(this.server.sockets.sockets.values()).find(
      (it: LauncherSocket) => it.steam_id === playerId.value,
    ) as LauncherSocket;
  }

  public findAll(playerId: PlayerId): LauncherSocket[] {

    return Array.from(this.server.sockets.sockets.values()).filter(
      (it: LauncherSocket) => it.steam_id === playerId.value,
    ) as LauncherSocket[];
  }

  public async updateQueue(client: LauncherSocket) {
    const qState = await this.qbus.execute<
      GetUserQueueQuery,
      GetUserQueueQueryResult
    >(new GetUserQueueQuery(new PlayerId(client.steam_id)));

    if(qState.version){
      client.emit(
        Messages.QUEUE_STATE,
        { mode: qState.mode!, version: qState.version!, inQueue: true  } satisfies InQueueStateMessage
      )
    }else {
      client.emit(
        Messages.QUEUE_STATE,
        { inQueue: false  } satisfies InactiveQueueStateMessage
      )
    }
  }

  public async broadcast<T>(plrs: PlayerId[], t: (p: PlayerId) => [any, T]) {
    plrs.forEach(plr => {
      const sockets = this.findAll(plr);
      const s = t(plr);
      sockets.forEach(socket => socket.emit(s[0], s[1]));
    });
  }

  public deliver<T>(
    plrs: PlayerId | PlayerId[],
    key: Messages,
    value?: any,
  ) {
    (Array.isArray(plrs) ? plrs : [plrs]).forEach(plr => {
      const sockets = this.findAll(plr);
      sockets.forEach(socket => socket.emit(key, value));
    });
  }
}
