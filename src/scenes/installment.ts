import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { chunkArrayInline, keyboards } from "../utils/keyboards";
import { callback } from "telegraf/typings/button";
import { inlineKeyboard } from "telegraf/typings/markup";
const scene = new Scenes.BaseScene("installment");

scene.action(/^confirm/, async (ctx: any) => {
  const callbackData = ctx.callbackQuery.data;
  const productId = callbackData.split("_")[1];
  const user_id = String(ctx.from?.id);

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

  const product = await prisma.product.findFirst({
    where: {
      id: String(productId),
    },
  });

  if (!product) {
    return ctx.reply("Bunday telefon topilmadi");
  }

  let initPercentage = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

  let initKeyboard = initPercentageKeyboard(initPercentage, productId);
  ctx.editMessageText("Quyidagi boshlang'ich to'lovlardan birini tanlang", {
    reply_markup: {
      inline_keyboard: initKeyboard,
    },
  });
});

scene.action(/^per_/, async (ctx: any) => {
  const callbackData = ctx.callbackQuery.data;
  const percentage = callbackData.split("_")[1];
  const productId = callbackData.split("_")[2];
  const user_id = String(ctx.from?.id);

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

  const product = await prisma.product.findFirst({
    where: {
      id: String(productId),
    },
  });

  if (!product) {
    return ctx.reply("Bunday telefon topilmadi");
  }

  ctx.reply("To'lov muvaffaqiyatli amalga oshirildi");
});

let initPercentageKeyboard = (initPercentage: number[], itemId: String) => {
  return chunkArrayInline(
    initPercentage.map((item) => {
      return {
        text: `${item}%`,
        callback_data: `per_${item}_${itemId}`,
      };
    }),
    2
  );
};
export default scene;
