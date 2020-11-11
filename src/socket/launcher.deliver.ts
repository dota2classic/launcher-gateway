import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayerId } from '../gateway/shared-types/player-id';
import { GetUserQueueQuery } from '../gateway/queries/GetUserQueue/get-user-queue.query';
import { GetUserQueueQueryResult } from '../gateway/queries/GetUserQueue/get-user-queue-query.result';
import { Messages } from './messages';
import { QueryBus } from '@nestjs/cqrs';



export interface LauncherSocket extends Socket {
  steam_id: string;
  playerId: PlayerId
}

@WebSocketGateway()
export class LauncherDeliver {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly qbus: QueryBus) {}

  public find(playerId: PlayerId): LauncherSocket | undefined {
    return Object.values(this.server.sockets.connected).find(
      (it: LauncherSocket) => it.steam_id === playerId.value,
    ) as LauncherSocket;
  }

  public async updateQueue(client: LauncherSocket) {
    const qState = await this.qbus.execute<
      GetUserQueueQuery,
      GetUserQueueQueryResult
    >(new GetUserQueueQuery(new PlayerId(client.steam_id)));

    client.emit(
      Messages.QUEUE_STATE,
      qState.mode === null ? undefined : qState.mode,
    );
  }

}
