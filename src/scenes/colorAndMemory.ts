import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { chunkArrayInline, keyboards } from "../utils/keyboards";
import { callback } from "telegraf/typings/button";
import { inlineKeyboard } from "telegraf/typings/markup";
import { sendProductDetails } from "./phones";
const scene = new Scenes.BaseScene("colorandmemory");

scene.action(/^color_/, async (ctx: any) => {
  const telegramId = String(ctx?.from?.id);
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: telegramId,
    },
  });

  if (!user) {
    console.log("user ");
    return await ctx.scene.enter("start");
  }

  const callbackData = ctx.callbackQuery.data;
  const colorId = callbackData.split("_")[1];

  const colorAndMemory = await prisma.productColorMemory.findFirst({
    where: {
      id: String(colorId),
    },
    include: {
      memory: true,
      color: true,
    },
  });

  if (!colorAndMemory) {
    await ctx.reply("Xatolik yuz berdi");
    return await ctx.scene.enter("start");
  }

  let product = await prisma.product.findFirst({
    where: {
      id: colorAndMemory.productId,
    },
    include: {
      productColorMemory: {
        include: {
          color: true,
          memory: true,
        },
        where: {
          colorId: colorAndMemory.colorId,
        },
      },
    },
  });

  if (!product) {
    await ctx.reply("Xatolik yuz berdi");
    return await ctx.scene.enter("start");
  }

  let memory: any = [];

  product.productColorMemory.forEach((item: any) => {
    memory.push({
      text: `${item.memory.name}GB`,
      callback_data: `memory_${item.id}`,
    });
  });

  if (memory.length === 0) {
    await sendProductDetails(
      ctx,
      prisma,
      product,
      colorId,
      colorAndMemory?.color?.name || "yo'q",
      "Yo'q"
    );
    return ctx.scene.enter("installment");
  }

  const keyboard = chunkArrayInline(memory, 2);
  keyboard.push([{ text: "Orqaga", callback_data: `back` }]);

  await ctx.reply("Xotirani tanlang", {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
});

scene.action(/^memory_/, async (ctx: any) => {
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
    },
  });

  if (!user) {
    return await ctx.scene.enter("start");
  }

  const callbackData = ctx.callbackQuery.data;
  const memoryId = callbackData.split("_")[1];

  const colorAndMemory = await prisma.productColorMemory.findFirst({
    where: {
      id: String(memoryId),
    },
    include: {
      color: true,
      memory: true,
    },
  });

  if (!colorAndMemory) {
    await ctx.reply("Xatolik yuz berdi");
    return await ctx.scene.enter("start");
  }

  let product = await prisma.product.findFirst({
    where: {
      id: colorAndMemory.productId,
    },
    include: {
      productColorMemory: {
        include: {
          color: true,
          memory: true,
        },
        where: {
          memoryId: colorAndMemory.memoryId,
        },
      },
    },
  });

  if (!product) {
    await ctx.reply("Xatolik yuz berdi");
    return await ctx.scene.enter("start");
  }

  await sendProductDetails(
    ctx,
    prisma,
    product,
    memoryId,
    colorAndMemory?.color?.name || "Yo'q",
    colorAndMemory?.memory?.name || "yo'q"
  );
  return ctx.scene.enter("installment");
});
scene.hears("/start", async (ctx: any) => {
  return await ctx.scene.enter("start");
});

export default scene;
