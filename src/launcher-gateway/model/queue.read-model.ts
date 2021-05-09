import { AggregateRoot } from '@nestjs/cqrs';
import { MatchmakingMode } from '../../gateway/shared-types/matchmaking-mode';
import { Dota2Version } from '../../gateway/shared-types/dota2version';

export class QueueReadModel extends AggregateRoot {


  public get id(): string {
    return QueueReadModel.id(this.mode, this.version)
  }

  public static id(mode: MatchmakingMode, version: Dota2Version): string{
    return `${mode}_${version}`
  }

  public inQueue: number = 0;
  constructor(public readonly mode: MatchmakingMode, public readonly version: Dota2Version) {
    super();
  }
}
