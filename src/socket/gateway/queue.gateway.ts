import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { QueueRepository } from '../../launcher-gateway/repository/queue.repository';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EnterQueue, Messages, ReadyCheck } from '../messages';
import { PlayerEnterQueueCommand } from '../../gateway/commands/player-enter-queue.command';
import { PlayerId } from '../../gateway/shared-types/player-id';
import { MatchmakingModes } from '../../gateway/shared-types/matchmaking-mode';
import { PlayerLeaveQueueCommand } from '../../gateway/commands/player-leave-queue.command';
import { ReadyState, ReadyStateReceivedEvent } from '../../gateway/events/ready-state-received.event';
import { LauncherSocket } from '../launcher.deliver';
import { Dota2Version } from '../../gateway/shared-types/dota2version';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class QueueGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly qRep: QueueRepository,
    private readonly ebus: EventBus,
    private readonly qbus: QueryBus,
    @Inject('QueryCore') private readonly redis: ClientProxy,
  ) {}

  @SubscribeMessage(Messages.ENTER_QUEUE)
  async onEnterQueue(
    @MessageBody() data: EnterQueue,
    @ConnectedSocket() client: LauncherSocket,
  ) {
    await this.redis
      .emit(
        PlayerEnterQueueCommand.name,
        new PlayerEnterQueueCommand(
          new PlayerId(client.steam_id),
          data.mode,
          data.version,
        ),
      )
      .toPromise();
  }

  @SubscribeMessage(Messages.LEAVE_ALL_QUEUES)
  async leaveAllQueues(@ConnectedSocket() client: LauncherSocket) {
    const cmds = MatchmakingModes.flatMap(mode => [
      this.redis
        .emit(
          PlayerLeaveQueueCommand.name,
          new PlayerLeaveQueueCommand(
            new PlayerId(client.steam_id),
            mode,
            Dota2Version.Dota_681,
          ),
        )
        .toPromise(),
      this.redis
        .emit(
          PlayerLeaveQueueCommand.name,
          new PlayerLeaveQueueCommand(
            new PlayerId(client.steam_id),
            mode,
            Dota2Version.Dota_684,
          ),
        )
        .toPromise(),
    ]);
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
}
