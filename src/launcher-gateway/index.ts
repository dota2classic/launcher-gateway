import { QueueUpdatedHandler } from './event-handler/queue-updated.handler';
import { QueueRepository } from './repository/queue.repository';
import { ReadyCheckStartedHandler } from './event-handler/ready-check-started.handler';
import { ReadyStateUpdatedHandler } from './event-handler/ready-check-updated.handler';
import { GameServerStartedHandler } from './event-handler/game-server-started.handler';
import { RoomNotReadyHandler } from './event-handler/room-not-ready.handler';
import { MatchFinishedHandler } from './event-handler/match-finished.handler';
import { outerQuery } from '../gateway/util/outerQuery';
import { QueueStateQuery } from '../gateway/queries/QueueState/queue-state.query';
import { GetSessionByUserQuery } from '../gateway/queries/GetSessionByUser/get-session-by-user.query';
import { GetUserQueueQuery } from '../gateway/queries/GetUserQueue/get-user-queue.query';
import { GetUserRoomQuery } from '../gateway/queries/GetUserRoom/get-user-room.query';

const EventHandlers = [
  QueueUpdatedHandler,
  ReadyCheckStartedHandler,
  ReadyStateUpdatedHandler,
  GameServerStartedHandler,
  RoomNotReadyHandler,
  MatchFinishedHandler,
];

const QueryHandlers = [

  outerQuery(QueueStateQuery, "QueryCore"),
  outerQuery(GetSessionByUserQuery, "QueryCore"),
  outerQuery(GetUserQueueQuery, "QueryCore"),
  outerQuery(GetUserRoomQuery, "QueryCore"),
];

export const GatewayProviders = [
  ...EventHandlers,
  ...QueryHandlers,

  QueueRepository,

];
