import { Logger } from '@nestjs/common';
import { inspect } from 'util';
import { AggregateRoot, EventPublisher } from '@nestjs/cqrs';

type Id = string | number;

export abstract class RuntimeRepository<
  T extends AggregateRoot,
  KeyName extends keyof T,
  Key = T[KeyName]
> {
  protected cache = new Map<Key, T>();

  protected get values(){
    return [...this.cache.values()]
  }

  protected constructor(protected readonly publisher: EventPublisher) {
    RuntimeRepository.list.push(this)
  }

  get = (id: Key): T | null => {
    const t = this.cache.get(id) || null;
    if (t) this.publisher.mergeObjectContext(t);
    return t;
  };

  save = (id: Key, item: T) => {
    this.publisher.mergeObjectContext(item);
    this.cache.set(id, item);
  };

  update = (id: Key, item: T) => {
    this.cache.set(id, item);
  };
  delete = (id: Key) => {
    this.cache.delete(id);
  };

  all = () => [...this.cache.values()];

  debugLog = () => {
    new Logger(RuntimeRepository.name).log(inspect([...this.cache.values()]));
  };


  private static list: RuntimeRepository<any, any>[] = [];

  private static clearAll(){
    this.list.forEach(it => it.cache.clear())
  }
}
