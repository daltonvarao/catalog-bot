import IORedis from "ioredis";
import { config } from "./config";

export const redisConnection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  tls: config.redis.tls,
  maxRetriesPerRequest: null,
});

// "redis://default:ATaKAAIjcDE4ZGVkZWVmMTA5NzI0Mjk2OGM4NzYxOWJlOWY2YTU3Y3AxMA@sacred-lab-13962.upstash.io:6379",
