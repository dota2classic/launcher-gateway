import { AggregateRoot } from '@nestjs/cqrs';
import { MatchmakingMode } from '../../gateway/shared-types/matchmaking-mode';

export class QueueReadModel extends AggregateRoot {


  public inQueue: number = 0;
  constructor(public readonly mode: MatchmakingMode) {
    super();
  }
}