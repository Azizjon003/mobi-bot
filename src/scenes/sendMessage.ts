import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { chunkArrayInline, keyboards } from "../utils/keyboards";
import { callback } from "telegraf/typings/button";
import { inlineKeyboard } from "telegraf/typings/markup";
const scene = new Scenes.BaseScene("send_message");
import xss from "xss";
scene.hears("/start", async (ctx: any) => {
  return await ctx.scene.enter("start");
});
scene.on("message", async (ctx: any) => {
  const users = await prisma.user.findMany();
  for (let user of users) {
    const userNameClean = xss(user.username ?? "Anonymous");
    try {
      await ctx.telegram.sendMessage(user.telegram_id, ctx.message.text, {
        parse_mode: "HTML",
      });
      await delay(1000);
    } catch (error) {
      console.log(error);
      ctx.reply(
        `Xabar yuborishda xatolik yuz berdi <a href="tg://user?id=${user.telegram_id}">${userNameClean}</a> foydalanvchi `,
        {
          parse_mode: "HTML",
        }
      );
    }
  }
  ctx.reply(
    "Xabar barcha foydalanuvchilarga yuborildi.\n Qanday xizmatlar bor menga admin :)"
  );
  return await ctx.scene.enter("start");
});
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default scene;
