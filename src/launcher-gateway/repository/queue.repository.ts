import { RuntimeRepository } from '../../util/runtime-repository';
import { QueueReadModel } from '../model/queue.read-model';
import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';

@Injectable()
export class QueueRepository extends RuntimeRepository<QueueReadModel, 'mode'>{
  constructor(publisher: EventPublisher) {
    super(publisher);
  }
}
