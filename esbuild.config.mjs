import { config } from "dotenv";
import { build } from "esbuild";

config();

const isProd = process.env.NODE_ENV === "production";

build({
  entryPoints: ["./src/app.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  outfile: "./dist/app.js",
  sourcemap: !isProd,
  minify: isProd,
  external: [
    "ioredis",
    "bullmq",
    "@grammyjs/conversations",
    "@grammyjs/menu",
    "grammy",
    "@bull-board/api",
    "@bull-board/express",
    "express",
    "dotenv",
  ],
})
  .then(() => {
    console.log(
      `⚡ Build completed successfully in ${
        isProd ? "production" : "development"
      } mode`
    );
  })
  .catch((err) => {
    console.error("❌ Build failed:", err);
    process.exit(1);
  });
