import { QueueStateHandler } from './query/GatewayQueueState/queue-state.handler';
import { QueueUpdatedHandler } from './event-handler/queue-updated.handler';
import { QueueRepository } from './repository/queue.repository';

const EventHandlers = [
  QueueUpdatedHandler
]


const QueryHandlers = [
  QueueStateHandler
]

export const GatewayProviders = [
  ...EventHandlers,
  ...QueryHandlers,

  QueueRepository
]