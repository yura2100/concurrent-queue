import { AsyncDatabase } from "promised-sqlite3";
import { JobID } from "../../types/job";
import { Storage } from '../../types/storage';
import {
  INIT_QUERY,
  SIZE_QUERY,
  SizeQueryResult,
  ADD_QUERY,
  GET_QUERY,
  GetQueryResult,
  REMOVE_QUERY,
} from "./queries";

type Sqlite3StorageOptions<T> = {
  readonly path: string;
  readonly serialize: (payload: T) => GetQueryResult["job"];
  readonly deserialize: (payload: GetQueryResult["job"]) => T;
};

export class Sqlite3Storage<T> implements Storage<T> {
  private readonly options: Sqlite3StorageOptions<T>;
  private _db: AsyncDatabase | null = null;

  constructor(options: Sqlite3StorageOptions<T>) {
    this.options = options;
  }

  private get db() {
    if (this._db === null) {
      throw new Error("Database is not initialized");
    }
    return this._db;
  }

  async init() {
    if (this._db !== null) {
      throw new Error("Database is already initialized");
    }

    this._db = await AsyncDatabase.open(this.options.path);
    await this.db.exec(INIT_QUERY);
  }

  async size() {
    const { counter } = await this.db.get<SizeQueryResult>(SIZE_QUERY);
    return counter;
  }

  async add(payload: T) {
    const serialezPayload = this.options.serialize(payload);
    const { lastID } = await this.db.run(ADD_QUERY, serialezPayload);
    return lastID;
  }

  async get(amount: number) {
    const jobs = await this.db.all<GetQueryResult>(GET_QUERY, amount);
    return jobs.map(({ id, job }) => {
      const payload = this.options.deserialize(job);
      return { id, payload };
    });
  }

  async remove(jobId: JobID) {
    await this.db.run(REMOVE_QUERY, jobId);
  }
}
