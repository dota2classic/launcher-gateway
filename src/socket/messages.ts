import { MatchmakingMode } from '../gateway/shared-types/matchmaking-mode';
import { Dota2Version } from '../gateway/shared-types/dota2version';
import { ReadyState } from '../gateway/events/ready-state-received.event';

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
  MATCH_FINISHED = 'MATCH_FINISHED',
  MATCH_RESULTS_READY = 'MATCH_RESULTS_READY',
  MATCH_STATE = 'MATCH_STATE',
  BROWSER_AUTH = 'BROWSER_AUTH',
  INVITE_TO_PARTY = 'INVITE_TO_PARTY',
  PARTY_INVITE_RECEIVED = 'PARTY_INVITE_RECEIVED',
  PARTY_INVITE_EXPIRED = 'PARTY_INVITE_EXPIRED',
  ACCEPT_PARTY_INVITE = 'ACCEPT_PARTY_INVITE',
  LEAVE_PARTY = 'LEAVE_PARTY',
  PARTY_UPDATED = 'PARTY_UPDATED',
  BAD_AUTH = 'BAD_AUTH',
  ONLINE_UPDATE = 'ONLINE_UPDATE',
}

interface ReadyCheckEntry {
  steamId: string;
  state: ReadyState
}
export interface ReadyCheckUpdate {
  roomID: string;
  mode: MatchmakingMode;
  total: number;
  accepted: number;
  entries: ReadyCheckEntry[]
}

export interface GameFound {
  mode: MatchmakingMode;
  total: number;
  roomID: string;
  accepted: number;
  entries: ReadyCheckEntry[]
}

export interface UpdateQueue {
  mode: MatchmakingMode;
  inQueue: number;
}

export interface EnterQueue {
  mode: MatchmakingMode;
  version: Dota2Version;
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

export class PartyInviteReceivedMessage {
  constructor(
    public readonly partyId: string,
    public readonly leader: string,
    public readonly inviteId: string,
  ) {}
}


export interface PartyInvite {
  id: string;
}


export interface BrowserSocketAuth {
  token: string;
  recaptchaToken: string;
}

export interface OnlineUpdateMessage {
  // List of online players
  online: string[];
}


export interface QueueStateMessage {
  inQueue: boolean;
}

export interface InQueueStateMessage extends  QueueStateMessage {
  inQueue: true;
  mode: MatchmakingMode;
  version: Dota2Version;
}

export interface InactiveQueueStateMessage extends  QueueStateMessage {
  inQueue: false;
}
