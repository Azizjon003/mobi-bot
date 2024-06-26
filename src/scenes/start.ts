import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import { sendCategories } from "./control";
import prisma from "../../prisma/prisma";
import { chunkArrayInline } from "../utils/keyboards";
const keyboard = [
  ["Userlarni ko'rish", "Faol foydalanuvchilar"],
  ["Mahsulotlar soni"],
  ["Foydalanuvchilarga xabar yuborish"],
];
export const keyboards = [];
const scene = new Scenes.BaseScene("start");
scene.enter(async (ctx: any) => {
  const user_id = String(ctx.from?.id);

  const isEnabled = await enabled(user_id, ctx.from.first_name);

  if (isEnabled === "one") {
    ctx.telegram.sendMessage(
      user_id,
      `Assalomu alaykum, ${ctx.from.first_name}!
    Telefon raqamingizni yuboring.Telefon raqamingizni kiriting Misol uchun: +998901234567
    `,
      {
        reply_markup: {
          // keyboard: [
          //   [{ text: "Telefon raqamni yuborish", request_contact: true }],
          // ],
          // resize_keyboard: true,
        },
      }
    );

    return await ctx.scene.enter("control");
  } else if (isEnabled === "four") {
    await sendCategories(ctx, prisma, chunkArrayInline);
    return await ctx.scene.enter("phones");
  } else if (isEnabled === "two") {
    ctx.reply("Assalomu alaykum admin xush kelibsiz", {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
      },
    });

    return await ctx.scene.enter("admin");
  }
});

export default scene;
