import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Cron } from '@nestjs/schedule';
import { SyncQueueStateEvent } from '../event/sync-queue-state.event';

@Injectable()
export class RoomSaga {
  constructor(private readonly ebus: EventBus) {}

  // each 5 seconds
  @Cron('0 */5 * * * *')
  async checkBotGame() {
    this.ebus.publish(new SyncQueueStateEvent());
  }
}
