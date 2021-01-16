import { QueueUpdatedHandler } from './event-handler/queue-updated.handler';
import { QueueRepository } from './repository/queue.repository';
import { ReadyCheckStartedHandler } from './event-handler/ready-check-started.handler';
import { ReadyStateUpdatedHandler } from './event-handler/ready-check-updated.handler';
import { RoomNotReadyHandler } from './event-handler/room-not-ready.handler';
import { MatchFinishedHandler } from './event-handler/match-finished.handler';
import { outerQuery } from '../gateway/util/outerQuery';
import { GetQueueStateQuery } from '../gateway/queries/QueueState/get-queue-state.query';
import { GetSessionByUserQuery } from '../gateway/queries/GetSessionByUser/get-session-by-user.query';
import { GetUserQueueQuery } from '../gateway/queries/GetUserQueue/get-user-queue.query';
import { GetUserRoomQuery } from '../gateway/queries/GetUserRoom/get-user-room.query';
import { PartyInviteCreatedHandler } from './event-handler/party-invite-created.handler';
import { GetUserInfoQuery } from '../gateway/queries/GetUserInfo/get-user-info.query';
import { PartyInviteExpiredHandler } from './event-handler/party-invite-expired.handler';
import { PartyUpdatedHandler } from './event-handler/party-updated.handler';
import { GameResultsHandler } from './event-handler/game-results.handler';
import { MatchStartedHandler } from './event-handler/match-started.handler';

const EventHandlers = [
  QueueUpdatedHandler,
  ReadyCheckStartedHandler,
  ReadyStateUpdatedHandler,


  MatchStartedHandler,
  RoomNotReadyHandler,
  MatchFinishedHandler,
  PartyInviteCreatedHandler,

  GameResultsHandler,

  PartyInviteExpiredHandler,
  PartyUpdatedHandler
];

const QueryHandlers = [

  outerQuery(GetQueueStateQuery, "QueryCore"),
  outerQuery(GetSessionByUserQuery, "QueryCore"),
  outerQuery(GetUserQueueQuery, "QueryCore"),
  outerQuery(GetUserRoomQuery, "QueryCore"),
  outerQuery(GetUserInfoQuery, "QueryCore"),
];

export const GatewayProviders = [
  ...EventHandlers,
  ...QueryHandlers,

  QueueRepository,

];
