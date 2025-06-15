import dotenv from "dotenv";
import { build } from "esbuild";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

build({
  entryPoints: ["src/bot.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  outfile: "dist/bot.js",
  minify: isProd,
  sourcemap: !isProd,
  external: [
    "bullmq",
    "ioredis",
    "express",
    "@grammyjs/menu",
    "grammy",
    "@bull-board/express",
    "@bull-board/api",
    "dotenv",
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
  },
}).catch(() => process.exit(1));
