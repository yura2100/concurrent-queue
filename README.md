# Simple concurrent queue with persistent storage

### Data layer is backward compatible with [node-persistent-queue](https://github.com/damoclark/node-persistent-queue)

### Usage

#### Define payload type
```typescript
type Payload = {
  readonly name: number;
  readonly email: string;
};
```

#### Create storage adapter
```typescript
const storage = new Sqlite3Storage<Payload>({
  path: "users.sqlite",
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});
```

#### Create queue
```typescript
const queue = new Queue<Payload>({
  storage,
  concurrency: 3,
  batchSize: 6,
  handler: async (payload) => {
    await saveToDb(payload);
  },
});
```
`concurrency` - number of concurrent jobs

`batchSize` - number of jobs to fetch from storage at once

#### Initialize queue and add jobs
```typescript
await queue.init();

await queue.add({ name: "User 1", email: "user1@gmail.com" });
await queue.add({ name: "User 2", email: "user2@gmail.com" });
await queue.add({ name: "User 3", email: "user3@gmail.com" });
```