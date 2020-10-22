
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { QueueStateQuery } from '../../../gateway/queries/QueueState/queue-state.query';
import { QueueStateQueryResult } from '../../../gateway/queries/QueueState/queue-state-query.result';

@QueryHandler(QueueStateQuery)
export class QueueStateHandler
  implements IQueryHandler<QueueStateQuery, QueueStateQueryResult> {
  private readonly logger = new Logger(QueueStateHandler.name);

  constructor(@Inject('QueryCore') private queryCore: ClientProxy) {}

  async execute(command: QueueStateQuery): Promise<QueueStateQueryResult> {
    return this.queryCore
      .send<QueueStateQueryResult>(QueueStateQuery.name, command)
      .toPromise();
  }
}
