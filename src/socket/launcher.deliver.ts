import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PlayerId } from '../gateway/shared-types/player-id';
import { LauncherSocket } from './launcher.gateway';

@WebSocketGateway()
export class LauncherDeliver {
  @WebSocketServer()
  public server: Server;

  public find(playerId: PlayerId): LauncherSocket | undefined {
    return Object.values(this.server.sockets.connected).find(
      (it: LauncherSocket) => it.steam_id === playerId.value,
    ) as LauncherSocket;
  }

  // private findSocketByUserID(uid: UserId) {
  //   return Object.values(this.server.sockets.connected).find(
  //     (it: RevolverSocket) => it.identify.userID === uid,
  //   ) as RevolverSocket;
  // }
}
