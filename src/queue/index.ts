import { combineLatest, filter, mergeMap, Subject, tap } from "rxjs";
import { Job } from "../types/job";
import { Storage } from '../types/storage';
import { Counter } from "./counter";

type QueueOptions<T> = {
  storage: Storage<T>;
  concurrency: number;
  batchSize: number;
  handler: (payload: T) => Promise<void>;
};

export class Queue<T> {
  private readonly options: QueueOptions<T>;
  private readonly jobs$ = new Subject<Job<T>>();
  private readonly size = new Counter();
  private readonly unprocessed = new Counter();
  private readonly capacities$ = combineLatest([
    this.size.asObservable(),
    this.unprocessed.asObservable(),
  ]);

  constructor(options: QueueOptions<T>) {
    this.options = options;
  }

  async init() {
    await this.options.storage.init();

    this.jobs$
      .pipe(
        tap(() => this.unprocessed.increment()),
        mergeMap(async (job) => {
          await this.options.handler(job.payload);
          await this.options.storage.remove(job.id);
          this.size.decrement();
          this.unprocessed.decrement();
        }, this.options.concurrency),
      ).subscribe();

    this.capacities$
      .pipe(
        filter(([size, unprocessed]) => size > 0 && unprocessed === 0),
        mergeMap(async () => {
          const jobs = await this.options.storage.get(this.options.batchSize);
          jobs.forEach((job) => this.jobs$.next(job));
        })
      ).subscribe();

    const size = await this.options.storage.size();
    this.size.set(size);
  }

  async add(payload: T) {
    await this.options.storage.add(payload);
    this.size.increment();
  }
}
