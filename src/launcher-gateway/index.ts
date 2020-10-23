import { QueueStateHandler } from './query/GatewayQueueState/queue-state.handler';
import { QueueUpdatedHandler } from './event-handler/queue-updated.handler';
import { QueueRepository } from './repository/queue.repository';
import { ReadyCheckStartedHandler } from './event-handler/ready-check-started.handler';
import { ReadyStateUpdatedHandler } from './event-handler/ready-check-updated.handler';
import { GameServerStartedHandler } from './event-handler/game-server-started.handler';
import { GetUserRoomHandler } from './query/GetUserRoom/get-user-room.handler';
import { RoomNotReadyHandler } from './event-handler/room-not-ready.handler';
import { GetUserQueueHandler } from './query/GetUserQueue/get-user-queue.handler';

const EventHandlers = [
  QueueUpdatedHandler,
  ReadyCheckStartedHandler,
  ReadyStateUpdatedHandler,
  GameServerStartedHandler,
  RoomNotReadyHandler,
];

const QueryHandlers = [QueueStateHandler, GetUserQueueHandler];

export const GatewayProviders = [
  ...EventHandlers,
  ...QueryHandlers,

  GetUserRoomHandler,
  QueueRepository,
];
