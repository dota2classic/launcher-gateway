import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventBus, ofType } from '@nestjs/cqrs';
import { ReadyStateReceivedEvent } from './gateway/events/ready-state-received.event';

@Injectable()
export class GatewayService implements OnApplicationBootstrap {
  constructor(
    @Inject('QueryCore') private queryCore: ClientProxy,
    private readonly ebus: EventBus
  ) {}

  async onApplicationBootstrap() {
    await this.queryCore.connect();

    const publicEvents: any[] = [ReadyStateReceivedEvent];
    this.ebus
      .pipe(ofType(...publicEvents))
      .subscribe(t => this.queryCore.emit(t.constructor.name, t));
  }
}
