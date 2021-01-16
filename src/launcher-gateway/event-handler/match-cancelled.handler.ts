import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MatchCancelledEvent } from '../../gateway/events/match-cancelled.event';

@EventsHandler(MatchCancelledEvent)
export class MatchCancelledHandler implements IEventHandler<MatchCancelledEvent> {
  constructor() {}

  async handle(event: MatchCancelledEvent) {

  }
}
