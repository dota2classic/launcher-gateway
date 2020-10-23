import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetUserQueueQuery } from '../../../gateway/queries/GetUserQueue/get-user-queue.query';
import { ClientProxy } from '@nestjs/microservices';
import { QueueStateQueryResult } from '../../../gateway/queries/QueueState/queue-state-query.result';
import { QueueStateQuery } from '../../../gateway/queries/QueueState/queue-state.query';
import { GetUserQueueQueryResult } from '../../../gateway/queries/GetUserQueue/get-user-queue-query.result';

@QueryHandler(GetUserQueueQuery)
export class GetUserQueueHandler implements IQueryHandler<GetUserQueueQuery, GetUserQueueQueryResult> {

  private readonly logger = new Logger(GetUserQueueHandler.name)

  constructor(@Inject('QueryCore') private queryCore: ClientProxy) {}

  async execute(command: GetUserQueueQuery): Promise<GetUserQueueQueryResult> {
    return this.queryCore
      .send<GetUserQueueQueryResult>(GetUserQueueQuery.name, command)
      .toPromise();
  }

}