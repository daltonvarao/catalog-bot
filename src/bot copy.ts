import {
  Conversation,
  ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { Menu } from "@grammyjs/menu";
import { Bot, Context } from "grammy";
import { config } from "./config";

export const bot = new Bot<ConversationFlavor<Context>>(config.telegram.token);

const menu = new Menu("Menu")
  .text("Responder em 1min", async (ctx) => {
    await ctx.reply("Vou te responder em 1 minuto!");
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

  // await queue.add(QueuesConfig.processPhotos, {
  //   file,
  //   caption: ctx.message.caption || "",
  // });
  await ctx.reply("Your photo is being processed. Please wait...");
});
