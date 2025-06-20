import {
  Conversation,
  ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { Menu } from "@grammyjs/menu";
import { Bot, Context } from "grammy";
import { CatalogService } from "./catalogs/catalog.service";
import { config } from "./config";
import { Exception } from "./exceptions/base.exceptions";

export const bot = new Bot<ConversationFlavor<Context>>(config.telegram.token);

const catalogService = new CatalogService();

const replyWithError = async (
  ctx: Context,
  e: any,
  defaultMsg = "Erro ao realizar operação. Tente novamente em instantes"
) => {
  console.log(e);
  if (e instanceof Exception) {
    await ctx.reply(e.message);
    return;
  }

  await ctx.reply(defaultMsg);
  return;
};

const parseError = async (
  e: any,
  cb: (msg: string) => any | Promise<any>,
  defaultMsg = "Erro ao realizar operação. Tente novamente em instantes"
) => {
  console.log(e);
  if (e instanceof Exception) {
    return cb(e.message);
  }

  return cb(defaultMsg);
};

async function createCatalogConversation(
  conversation: Conversation,
  ctx: Context
) {
  await ctx.reply("Digite o nome do catalogo");
  const { message } = await conversation.waitFor("message:text", {
    maxMilliseconds: 60000,
  });

  if (!message || !message.text) {
    await ctx.reply("Nome do catalogo não pode ser vazio.");
    return;
  }

  try {
    await conversation.external(async (ctx) => {
      await catalogService.createCatalog({ name: message.text });
      await ctx.reply(`Catalogo "${message.text}" criado com sucesso!`);
    });
  } catch (e) {
    console.error(e);
    await parseError(e, (msg) => ctx.reply(msg));
    return;
    // await replyWithError(ctx, e, "Erro ao criar catalogo. Tente novamente");
  }
}

const conversationList = {
  createCatalogConversation: {
    name: "createCatalogConversation",
    conversation: createCatalogConversation,
  },
};

bot.use(conversations());

bot.use(
  ...Object.keys(conversationList).map((k) =>
    createConversation(
      conversationList[k as keyof typeof conversationList].conversation
    )
  )
);

// bot
//   .use()
//   .use(createConversation(deleteCatalogConversation));

const menu = new Menu<ConversationFlavor<Context>>("Menu")
  .text("criar catalogo", async (ctx) => {
    return ctx.conversation.enter(
      conversationList.createCatalogConversation.name
    );
  })
  .row()
  .text("listar catalogos", async (ctx) => {
    await ctx.reply("Listando catalogo...");

    const catalogs = await catalogService.listCatalogs();
    if (catalogs.length === 0) {
      await ctx.reply("Nenhum catalogo encontrado.");
      return;
    }
    const catalogList = catalogs
      .map((catalog) => `${catalog.id}. ${catalog.name}`)
      .join("\n");
    await ctx.reply(`Lista de Catalogos:\n${catalogList}`);
  })
  .row()
  .text("excluir catalogo", (ctx) => {
    return ctx.reply("Excluindo catalogo...");
  });

bot.use(menu);

bot.command("menu", async (ctx) => {
  await ctx.reply("O que voce deseja fazer?", {
    reply_markup: menu,
  });
});

// async function deleteCatalogConversation(
//   conversation: Conversation,
//   ctx: Context
// ) {
//   if (catalogs.length === 0) {
//     await ctx.reply("Nenhum catalogo encontrado para excluir.");
//     return;
//   }
//   const menu1 = conversation
//     .menu("deleteCatalogMenu")
//     // .dynamic((ctx, range) => {
//     //   for (const catalog of catalogs) {
//     //     range
//     //       .text(catalog.name, (ctx) => ctx.reply(`You chose ${catalog.name}`))
//     //       .row();
//     //   }
//     // })
//     .text("Cancelar", (ctx) => ctx.reply("Operação cancelada."));

//   await ctx.reply("Selecione o catalogo que deseja excluir:", {
//     reply_markup: menu1,
//   });
// }

bot.command("help", (ctx) => {
  ctx.reply("Send me a photo and I'll process it. Use /start to begin.");
});

// bot.command("lista_catalogos", (ctx) => {
//   if (catalogs.length === 0) {
//     ctx.reply("Nenhum catalogo encontrado.");
//     return;
//   }

//   const catalogList = catalogs
//     .map((catalog, index) => `${index + 1}. ${catalog.name}`)
//     .join("\n");
//   ctx.reply(`Lista de Catalogos:\n${catalogList}`);
// });

export const commands = [
  { command: "menu", description: "Open the bot menu" },
  { command: "help", description: "Show help text" },
];

// bot.on("message:photo", async (ctx) => {
//   const file = await ctx.getFile(); // valid for at least 1 hour
//   // const path = file.file_path; // file path on Bot API server
//   // await ctx.reply("Download your own file again: " + path);

//   await queue.add(QueuesConfig.processPhotos, {
//     file,
//     caption: ctx.message.caption || "",
//   });
//   await ctx.reply("Your photo is being processed. Please wait...");
// });
