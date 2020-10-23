import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GetSessionByUserQuery } from '../../../gateway/queries/GetSessionByUser/get-session-by-user.query';
import { GetSessionByUserQueryResult } from '../../../gateway/queries/GetSessionByUser/get-session-by-user-query.result';
import { QueueStateHandler } from '../GatewayQueueState/queue-state.handler';

@QueryHandler(GetSessionByUserQuery)
export class GetSessionByUserHandler
  implements IQueryHandler<GetSessionByUserQuery, GetSessionByUserQueryResult> {
  private readonly logger = new Logger(QueueStateHandler.name);

  constructor(@Inject('QueryCore') private queryCore: ClientProxy) {}

  async execute(
    command: GetSessionByUserQuery,
  ): Promise<GetSessionByUserQueryResult> {
    return this.queryCore
      .send<GetSessionByUserQueryResult>(GetSessionByUserQuery.name, command)
      .toPromise();
  }
}
