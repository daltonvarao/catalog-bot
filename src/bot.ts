import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import {
  Conversation,
  ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { Menu } from "@grammyjs/menu";
import { Queue, Worker } from "bullmq";
import express from "express";
import { Bot, Context } from "grammy";
import IORedis from "ioredis";
import { config } from "./config";

const bot = new Bot<ConversationFlavor<Context>>(config.telegram.token);
const connection = new IORedis({
  maxRetriesPerRequest: null,
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
});

const queue = new Queue("process-photos");
const delayReply = new Queue("delay-reply");

const worker = new Worker(
  "process-photos",
  async (job) => {
    console.log(job);
  },
  {
    connection,
  }
);

const delayReplyWorker = new Worker(
  "delay-reply",
  async (job) => {
    bot.api.sendMessage(job.data.chatId, "botar feijão de molho");
  },
  {
    connection,
  }
);

const commands = [
  { command: "novo_catalogo", description: "Criar novo catalogo" },
  { command: "lista_catalogos", description: "Listar todos catalogo" },
  { command: "excluir_catalogo", description: "Excluir um catalogo" },
  { command: "menu", description: "Open the bot menu" },
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help text" },
  { command: "settings", description: "Open settings" },
];

const menu = new Menu("Menu")
  .text("Responder em 1min", async (ctx) => {
    await ctx.reply("Vou te responder em 1 minuto!");
    await delayReply.add(
      "delay-reply",
      {
        chatId: ctx.chat!.id,
      },
      {
        delay: 15 * 1000, // 1 minute
      }
    );
  })
  .row()
  .text("B", (ctx) => ctx.replyWithDice("🎲"));

bot.use(menu);
bot.use(conversations());

const catalogs = [
  {
    name: "Chapeus",
  },
  {
    name: "Oculos",
  },
];

async function createCatalogConversation(
  conversation: Conversation,
  ctx: Context
) {
  await ctx.reply("Digite o nome do catalogo");
  const { message } = await conversation.waitFor("message:text", {
    maxMilliseconds: 30000, // 30 seconds timeout
  });
  if (!message || !message.text) {
    await ctx.reply("Nome do catalogo não pode ser vazio.");
    return;
  }

  const catalogExists = catalogs.some(
    (catalog) => catalog.name.toLowerCase() === message.text.toLowerCase()
  );
  if (catalogExists) {
    await ctx.reply(`Catalogo "${message.text}" já existe.`);
    return;
  }
  catalogs.push({ name: message.text });

  await ctx.reply(`Catalogo "${message.text}" criado com sucesso!`);
}

async function deleteCatalogConversation(
  conversation: Conversation,
  ctx: Context
) {
  if (catalogs.length === 0) {
    await ctx.reply("Nenhum catalogo encontrado para excluir.");
    return;
  }
  const menu1 = conversation
    .menu("deleteCatalogMenu")
    // .dynamic((ctx, range) => {
    //   for (const catalog of catalogs) {
    //     range
    //       .text(catalog.name, (ctx) => ctx.reply(`You chose ${catalog.name}`))
    //       .row();
    //   }
    // })
    .text("Cancelar", (ctx) => ctx.reply("Operação cancelada."));

  await ctx.reply("Selecione o catalogo que deseja excluir:", {
    reply_markup: menu1,
  });
}

bot
  .use(createConversation(createCatalogConversation))
  .use(createConversation(deleteCatalogConversation));

bot.command("menu", async (ctx) => {
  await ctx.reply("Check out this menu:", {
    reply_markup: menu,
  });
});

bot.command("help", (ctx) => {
  ctx.reply("Send me a photo and I'll process it. Use /start to begin.");
});

bot.command("novo_catalogo", async (ctx) => {
  await ctx.conversation.enter("createCatalogConversation");
});

bot.command("excluir_catalogo", async (ctx) => {
  await ctx.conversation.enter("deleteCatalogConversation");
});

bot.command("lista_catalogos", (ctx) => {
  if (catalogs.length === 0) {
    ctx.reply("Nenhum catalogo encontrado.");
    return;
  }

  const catalogList = catalogs
    .map((catalog, index) => `${index + 1}. ${catalog.name}`)
    .join("\n");
  ctx.reply(`Lista de Catalogos:\n${catalogList}`);
});

bot.on("message:photo", async (ctx) => {
  const file = await ctx.getFile(); // valid for at least 1 hour
  // const path = file.file_path; // file path on Bot API server
  // await ctx.reply("Download your own file again: " + path);

  await queue.add("process-photo", {
    file,
    caption: ctx.message.caption || "",
  });
  await ctx.reply("Your photo is being processed. Please wait...");
});

const app = express();
const port = process.env.PORT || 3000;

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(queue), new BullMQAdapter(delayReply)],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

async function start() {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Bull Board: http://localhost:${port}/admin/queues`);
  });

  await bot.api.setMyCommands(commands);

  await bot.start({
    onStart: (info) => {
      console.log(info);
      console.log("Bot started successfully!");
    },
  });
}

start();
