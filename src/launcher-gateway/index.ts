import { QueueStateHandler } from './query/GatewayQueueState/queue-state.handler';
import { QueueUpdatedHandler } from './event-handler/queue-updated.handler';
import { QueueRepository } from './repository/queue.repository';
import { ReadyCheckStartedHandler } from './event-handler/ready-check-started.handler';
import { ReadyStateUpdatedHandler } from './event-handler/ready-check-updated.handler';
import { GameServerStartedHandler } from './event-handler/game-server-started.handler';

const EventHandlers = [
  QueueUpdatedHandler,
  ReadyCheckStartedHandler,
  ReadyStateUpdatedHandler,
  GameServerStartedHandler
];

const QueryHandlers = [QueueStateHandler];

export const GatewayProviders = [
  ...EventHandlers,
  ...QueryHandlers,

  QueueRepository,
];
