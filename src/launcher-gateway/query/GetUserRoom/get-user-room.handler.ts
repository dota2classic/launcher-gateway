import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetUserRoomQuery } from '../../../gateway/queries/GetUserRoom/get-user-room.query';
import { GetUserRoomQueryResult } from '../../../gateway/queries/GetUserRoom/get-user-room-query.result';
import { ClientProxy } from '@nestjs/microservices';

@QueryHandler(GetUserRoomQuery)
export class GetUserRoomHandler
  implements IQueryHandler<GetUserRoomQuery, GetUserRoomQueryResult> {
  private readonly logger = new Logger(GetUserRoomHandler.name);

  constructor(@Inject('QueryCore') private queryCore: ClientProxy) {}

  async execute(command: GetUserRoomQuery): Promise<GetUserRoomQueryResult> {
    return this.queryCore
      .send<GetUserRoomQueryResult>(GetUserRoomQuery.name, command)
      .toPromise();
  }
}
