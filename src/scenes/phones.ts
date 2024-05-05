import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { chunkArrayInline, keyboards } from "../utils/keyboards";
import { callback } from "telegraf/typings/button";
import { inlineKeyboard } from "telegraf/typings/markup";
import { Prisma } from "@prisma/client";
const scene = new Scenes.BaseScene("phones");

scene.hears("/start", async (ctx: any) => {
  return await ctx.scene.enter("start");
});

scene.action(/^next_/, async (ctx: any) => {
  const callbackData = ctx.callbackQuery.data;
  const categoryId = callbackData.split("_")[1];
  const page = Number(callbackData.split("_")[2]);

  console.log(callbackData);
  let categoryDatas = await getPaginatedProducts(prisma, categoryId, page, 4);

  const total = categoryDatas.total;
  const categoryProducts = categoryDatas.products;

  if (total >= page * 4) {
    categoryProducts.push({
      text: "Keyingi sahifa",
      callback_data: `next_${categoryId}_${page + 1}`,
    });
  }
  categoryProducts.push({
    text: "Oldingi sahifa",
    callback_data: `prev_${categoryId}_${page - 1}`,
  });

  const inlineKeyboards = chunkArrayInline(categoryProducts, 1);

  console.log(inlineKeyboards);
  await ctx.editMessageText(`Quyidagi telefon rusumlaridan birini tanlang`, {
    reply_markup: {
      inline_keyboard: inlineKeyboards,
    },
  });
});

scene.action(/^prev/, async (ctx: any) => {
  const callbackData = ctx.callbackQuery.data;
  const categoryId = callbackData.split("_")[1];
  const page = Number(callbackData.split("_")[2]);

  console.log(callbackData);
  let categoryDatas = await getPaginatedProducts(prisma, categoryId, page, 4);

  const total = categoryDatas.total;
  const categoryProducts = categoryDatas.products;

  if (page >= 1) {
    categoryProducts.push({
      text: "Keyingi sahifa",
      callback_data: `next_${categoryId}_${page + 1}`,
    });
    if (page !== 1)
      categoryProducts.push({
        text: "Avvalgi sahifa",
        callback_data: `prev_${categoryId}_${page - 1}`,
      });
  }

  const inlineKeyboards = chunkArrayInline(categoryProducts, 1);

  console.log(inlineKeyboards);
  await ctx.editMessageText(`Quyidagi telefon rusumlaridan birini tanlang`, {
    reply_markup: {
      inline_keyboard: inlineKeyboards,
    },
  });
});

scene.action(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
  async (ctx: any) => {
    const user_id = String(ctx.from?.id);
    const categoryId = ctx.callbackQuery.data;

    const user = await prisma.user.findFirst({
      where: {
        telegram_id: user_id,
      },
    });

    if (!user) {
      return ctx.reply(
        "Siz ro'yxatdan o'tmagansiz. Iltimos, /start buyrug'ini bosing"
      );
    }

    const getCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
      },
    });

    if (!getCategory) {
      return ctx.reply("Bunday kategoriya mavjud emas");
    }

    let categoryDatas = await getPaginatedProducts(prisma, categoryId, 1, 4);

    const total = categoryDatas.total;
    const categoryProducts = categoryDatas.products;

    if (total > 4)
      categoryProducts.push({
        text: "Keyingi sahifa",
        callback_data: `next_${categoryId}_2`,
      });

    const inlineKeyboards = chunkArrayInline(categoryProducts, 1);

    console.log(inlineKeyboards);
    await ctx.editMessageText(`Quyidagi telefon rusumlaridan birini tanlang`, {
      reply_markup: {
        inline_keyboard: inlineKeyboards,
      },
    });
  }
);

async function getPaginatedProducts(
  prisma: any,
  categoryId: string,
  page: number,
  pageSize: number
) {
  const skip = (page - 1) * pageSize;

  const products = (
    await prisma.product.findMany({
      where: {
        category_id: categoryId,
      },
      take: pageSize,
      skip: skip,
    })
  ).map((item: any) => {
    return {
      text: item.name,
      callback_data: item.id,
    };
  });

  const totalCount = await prisma.product.count({
    where: {
      category_id: categoryId,
    },
  });

  return {
    products,
    total: totalCount,
  };
}
export default scene;
