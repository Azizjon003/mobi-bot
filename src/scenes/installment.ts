import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { chunkArrayInline, keyboards } from "../utils/keyboards";
import { callback } from "telegraf/typings/button";
import { inlineKeyboard } from "telegraf/typings/markup";
import { formatNumber } from "../lib/helper";
const scene = new Scenes.BaseScene("installment");
import path from "path";
import fs from "fs";
import pdfMake from "pdfmake";

const Printer = new pdfMake({
  Roboto: {
    normal: "fonts/Roboto-Italic.ttf",
  },
});
scene.action(["main_menu", /^cancel/], async (ctx: any) => {
  ctx.deleteMessage();
  await ctx.scene.enter("start");
});
scene.action(/^confirm/, async (ctx: any) => {
  const callbackData = ctx.callbackQuery.data;
  const productId = callbackData.split("_")[1];
  const user_id = String(ctx.from?.id);

  // await ctx.deleteMessage();

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

  const product = await prisma.productColorMemory.findFirst({
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

  const product = await prisma.productColorMemory.findFirst({
    where: {
      id: String(productId),
    },
    include: {
      color: true,
      memory: true,
      product: true,
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

  const { text, prices } = priceCalcFunk(totalPrice, Number(percentage));

  ctx.editMessageText(text, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Bosh sahifaga qaytish",
            callback_data: `main_menu`,
          },
        ],
      ],
    },
  });
  let textArray = [
    "Foydalanuvchi: " + user?.name,

    "telefon raqami: " + user?.phone,

    "Telefon: " + product.product.name,

    "Xotira: " + product?.memory?.name || "",

    "Rang: " + product?.color?.name || "",

    "Narxi: " + formatNumber(price.price * product.price) + " so'm",

    ...prices,
  ];

  const pathPdf = path.join(__dirname, `${user.telegram_id}.pdf`);

  const createPdfPath = await createPdf(textArray, pathPdf);

  const dtd = fs.readFileSync(pathPdf);

  await ctx.telegram.sendDocument(
    "-1002061335019",
    {
      source: dtd,
      filename: `${user.telegram_id}.pdf`,
    },
    {
      caption: `
      Kim tomonidan yuborildi <a href="tg://user?id=${user.telegram_id}">${user.id}</a>\
      Foydalanuvchi : ${user.name} \n Telefon : ${user.phone} \n Rusumi : ${product.product.name}\n ${text} `,
      parse_mode: "HTML",
    }
  );

  fs.unlinkSync(pathPdf);

  await prisma.order.create({
    data: {
      user_id: user.id,
      product_color_id: product.id,
      initial_price: totalPrice * percentage,
      price: totalPrice,
    },
  });
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
      txt = `3 oylik to'lov uchun umumiy summa: ${formatNumber(
        pricess
      )} so'm\nBo'lib to'lash: ${formatNumber(pricess / 3)} so'm`;
    } else if (mon === 6) {
      let pricess = corePrice + corePrice * 0.36757;
      txt = `6 oylik to'lov uchun umumiy summa: ${formatNumber(
        pricess
      )} so'm\nBo'lib to'lash: ${formatNumber(pricess / 6)} so'm`;
    } else if (mon === 12) {
      let pricess = corePrice + corePrice * 0.74;
      txt = `12 oylik to'lov uchun umumiy summa: ${formatNumber(
        pricess
      )} so'm\nBo'lib to'lash: ${formatNumber(pricess / 12)} so'm`;
    }

    prices.push(`${txt}\n`);

    text += txt + "\n\n";
  }

  return {
    text: text,
    prices: prices,
  };
};
async function createPdf(content: any, path: string) {
  let doc = {
    content: content,
    defaultStyle: {
      fontSize: 15,
    },
  };
  const time = new Date().getTime();

  let pdfDoc = Printer.createPdfKitDocument(doc);
  pdfDoc.pipe(fs.createWriteStream(path));
  pdfDoc.end();

  await sleep(500);

  return path;
}
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export default scene;
