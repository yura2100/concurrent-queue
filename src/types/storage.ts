import { Job, JobID } from "./job";

export interface Storage<T> {
  init(): Promise<void>;

  size(): Promise<number>;

  add(payload: T): Promise<JobID>;

  get(amount: number): Promise<ReadonlyArray<Job<T>>>;

  remove(jobId: JobID): Promise<void>;
}
