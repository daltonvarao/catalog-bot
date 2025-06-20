import { Request, Response } from "express";
import { bot, commands } from "./bot";
import { config } from "./config";
import { app } from "./server";

async function start() {
  const port = config.server.port;

  app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to the Bot API!");
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Bull Board: http://localhost:${port}/admin/queues`);
  });

  await bot.api.setMyCommands(commands);

  await bot.start({
    onStart: () => {
      console.log("Bot started successfully!");
    },
  });
}

start();
