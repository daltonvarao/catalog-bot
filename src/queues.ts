import { Queue, Worker } from "bullmq";
import { QueuesConfig } from "./queues.config";
import { redisConnection } from "./redis";

export const queue = new Queue(QueuesConfig.processPhotos);

new Worker(
  QueuesConfig.processPhotos,
  async (job) => {
    console.log(job);
  },
  {
    connection: redisConnection,
  }
);
