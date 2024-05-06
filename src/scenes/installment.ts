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

  const price = (await prisma.mobilePrice.findFirst({
    orderBy: {
      created_at: "desc",
    },
  })) || {
    price: 12700,
  };

  const totalPrice = price?.price * product.price;

  const text = priceCalcFunk(totalPrice, Number(percentage));

  ctx.editMessageText(text);
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

const priceCalcFunk = (price: number, percentage: number) => {
  let month = [3, 6, 12];
  let prices = [];

  let text = `Siz tanlagan to'lov ${percentage}% bo'yicha quyidagicha to'lashingiz mumkin:\n`;

  for (let mon of month) {
    let txt = "";
    let corePrice = price - (price * percentage) / 100;
    if (mon === 3) {
      let pricess = corePrice + corePrice * 0.20104;
      txt = `3 oylik to'lov: ${pricess} so'm\nBo'lib to'lash: ${
        pricess / 3
      } so'm`;
    } else if (mon === 6) {
      let pricess = corePrice + corePrice * 0.36757;
      txt = `6 oylik to'lov: ${pricess} so'm\nBo'lib to'lash: ${
        pricess / 6
      } so'm`;
    } else if (mon === 12) {
      let pricess = corePrice + corePrice * 0.74;
      txt = `12 oylik to'lov: ${pricess} so'm\nBo'lib to'lash: ${
        pricess / 12
      } so'm`;
    }

    text += txt + "\n\n";
  }

  return text;
};
export default scene;
