import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { chunkArrayInline, keyboards } from "../utils/keyboards";
import { callback } from "telegraf/typings/button";
import { inlineKeyboard } from "telegraf/typings/markup";
const scene = new Scenes.BaseScene("admin");

scene.hears("/start", async (ctx: any) => {
  return await ctx.scene.enter("start");
});

scene.hears("Userlarni ko'rish", async (ctx: any) => {
  const usersCount = await prisma.user.count();
  const newUsersCount = await prisma.user.count({
    where: {
      created_at: {
        gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      },
    },
  });

  ctx.reply(
    `Botimizda ${usersCount} ta foydalanuvchi bor\n24 soat ichida ${newUsersCount} ta yangi foydalanuvchi ro'yxatdan o'tgan`
  );
});

scene.hears("Faol foydalanuvchilar", async (ctx: any) => {
  const users = await prisma.user.findMany({
    where: {
      created_at: {
        gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      },
    },
  });

  let txt = "";
  users.map((user) => {
    txt += `${user.name} ${user.phone}\n`;
  });

  ctx.reply(txt);
});

scene.hears("Mahsulotlar soni", async (ctx: any) => {
  const products = await prisma.product.count();
  const newProducts = await prisma.product.count({
    where: {
      created_at: {
        gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      },
    },
  });

  ctx.reply(
    `Botimizda ${products} ta mahsulot bor\n24 soat ichida ${newProducts} ta yangi mahsulot qo'shilgan`
  );
});

scene.hears("Foydalanuvchilarga xabar yuborish", async (ctx: any) => {
  ctx.reply(
    "Xabar matnini kiriting.Agar xabarni bekor qilmoqchi bo'lsangiz /start ni bosing"
  );
  ctx.scene.enter("send_message");
});

export default scene;
