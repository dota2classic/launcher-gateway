import { MatchmakingMode } from '../gateway/shared-types/matchmaking-mode';
import { MatchInfo } from '../gateway/events/room-ready.event';

export enum Messages {
  AUTH = 'AUTH',
  QUEUE_UPDATE = 'QUEUE_UPDATE',
  ENTER_QUEUE = 'ENTER_QUEUE',
  LEAVE_ALL_QUEUES = 'LEAVE_ALL_QUEUES',
  GAME_FOUND = 'GAME_FOUND',
  SET_READY_CHECK = 'SET_READY_CHECK',
  READY_CHECK_UPDATE = 'READY_CHECK_UPDATE',
  SERVER_STARTED = 'SERVER_STARTED',
  ROOM_STATE = 'ROOM_STATE',
  ROOM_NOT_READY = 'ROOM_NOT_READY',
  QUEUE_STATE = 'QUEUE_STATE',
}

export interface ReadyCheckUpdate {
  roomID: string;
  mode: MatchmakingMode;
  total: number;
  accepted: number;
}

export interface UpdateQueue {
  mode: MatchmakingMode;
  inQueue: number;
}

export interface EnterQueue {
  mode: MatchmakingMode;
}

export interface GameFound {
  mode: MatchmakingMode;
  total: number;
  roomID: string;
  accepted: number;
}

export interface ReadyCheck {
  roomID: string;
  accept: boolean;
}

export interface LauncherServerStarted {
  url: string;
}
