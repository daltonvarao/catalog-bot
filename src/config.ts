import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

export const config = {
  server: {
    port: parseInt(process.env.SERVER_PORT || "3000", 10),
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      "postgres://catalog:catalog@localhost:5432/catalog",
    ssl: isProduction ? { rejectUnauthorized: true } : false,
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: !isProduction ? { rejectUnauthorized: false } : undefined,
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN!,
  },
};
