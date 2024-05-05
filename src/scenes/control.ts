import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { chunkArrayInline, keyboards } from "../utils/keyboards";
import { callback } from "telegraf/typings/button";
import { inlineKeyboard } from "telegraf/typings/markup";
const scene = new Scenes.BaseScene("control");

scene.hears("/start", async (ctx: any) => {
  return await ctx.scene.enter("start");
});
scene.on("contact", async (ctx: any) => {
  const phone = ctx.message.contact.phone_number;
  const user_id = String(ctx.from?.id);

  const user = await prisma.user.findFirst({
    where: {
      telegram_id: user_id,
    },
  });

  console.log(user);
  if (!user) {
    return ctx.reply(
      "Siz ro'yxatdan o'tmagansiz. Iltimos, /start buyrug'ini bosing"
    );
  }

  const userUpdate = await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      phone: phone,
    },
  });

  // const category = (await prisma.category.findMany({})).map((item) => {
  //   return {
  //     text: item.name,
  //     callback_data: item.id,
  //   };
  // });

  // const inlineKeyboards = chunkArrayInline(category, 2);

  // ctx.reply("Quyidagi telefon rusumlaridan birini tanlang", {
  //   reply_markup: {
  //     inline_keyboard: inlineKeyboards,
  //   },
  // });

  await sendCategories(ctx, prisma, chunkArrayInline);
});

export async function sendCategories(
  ctx: any,
  prisma: any,
  chunkArrayInline: any
) {
  const category = (await prisma.category.findMany({})).map((item: any) => {
    return {
      text: item.name,
      callback_data: item.id,
    };
  });

  const inlineKeyboards = chunkArrayInline(category, 2);

  ctx.reply("Quyidagi telefon rusumlaridan birini tanlang", {
    reply_markup: {
      inline_keyboard: inlineKeyboards,
    },
  });
}

scene.on("message", async (ctx: any) => {
  ctx.reply("Iltimos, telefon raqamingizni yuboring");
});
export default scene;
