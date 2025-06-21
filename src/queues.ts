import { Queue, Worker } from "bullmq";
import { bot } from "./bot";
import { QueuesConfig } from "./queues.config";
import { redisConnection } from "./redis";

export const queue = new Queue(QueuesConfig.processPhotos, {
  connection: redisConnection,
});

new Worker(
  QueuesConfig.processPhotos,
  async (job) => {
    console.log("Received job:", job.id, "with data:", job.data);

    await bot.api.sendMessage(
      job.data.chatId,
      JSON.stringify(job.data, null, 2)
    );
  },
  {
    connection: redisConnection,
  }
);
