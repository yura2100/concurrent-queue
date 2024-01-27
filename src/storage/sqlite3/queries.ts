const JOBS_TABLE = 'queue';
const JOBS_COUNT_TABLE = 'queue_count';

export const INIT_QUERY = `
  CREATE TABLE IF NOT EXISTS ${JOBS_TABLE} (id INTEGER PRIMARY KEY ASC AUTOINCREMENT, job TEXT);

  CREATE TABLE IF NOT EXISTS ${JOBS_COUNT_TABLE} (counter BIGINT);

  INSERT INTO ${JOBS_COUNT_TABLE} SELECT 0 as counter WHERE NOT EXISTS(SELECT * FROM ${JOBS_COUNT_TABLE});

	UPDATE ${JOBS_COUNT_TABLE} SET counter = (SELECT count(*) FROM ${JOBS_TABLE});

	CREATE TRIGGER IF NOT EXISTS queue_insert
	AFTER INSERT
  ON ${JOBS_TABLE}
  BEGIN
  UPDATE ${JOBS_COUNT_TABLE} SET counter = counter + 1;
  END;

  CREATE TRIGGER IF NOT EXISTS queue_delete
  AFTER DELETE
  ON ${JOBS_TABLE}
  BEGIN
  UPDATE ${JOBS_COUNT_TABLE} SET counter = counter - 1;
  END;
`;

export type SizeQueryResult = {
  readonly counter: number;
};

export const SIZE_QUERY = `
  SELECT counter
  FROM ${JOBS_COUNT_TABLE}
  LIMIT 1;
`;

export const ADD_QUERY = `
  INSERT INTO ${JOBS_TABLE} (job)
  VALUES (?);
`;

export type GetQueryResult = {
  readonly id: number;
  readonly job: string;
};

export const GET_QUERY = `
  SELECT id, job
  FROM ${JOBS_TABLE}
  ORDER BY id ASC
  LIMIT ?;
`;

export const REMOVE_QUERY = `
  DELETE
  FROM ${JOBS_TABLE}
  WHERE id = ?;
`;
