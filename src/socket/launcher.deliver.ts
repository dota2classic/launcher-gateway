import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class LauncherDeliver {


  @WebSocketServer()
  public server: Server;

}