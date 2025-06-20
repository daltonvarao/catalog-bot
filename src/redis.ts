import IORedis from "ioredis";
import { config } from "./config";

export const redisConnection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  tls: { ...config.redis.tls },
  maxRetriesPerRequest: null,
});
