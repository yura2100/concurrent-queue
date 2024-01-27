export type JobID = number;

export type Job<T> = {
  readonly id: JobID;
  readonly payload: T;
};
