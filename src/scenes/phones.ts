import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { chunkArrayInline, keyboards } from "../utils/keyboards";
import { callback } from "telegraf/typings/button";
import { inlineKeyboard } from "telegraf/typings/markup";
import { Prisma } from "@prisma/client";
import { formatNumber } from "../lib/helper";
const scene = new Scenes.BaseScene("phones");

scene.hears("/start", async (ctx: any) => {
  return await ctx.scene.enter("start");
});

scene.action(["main_menu", /^cancel/], async (ctx: any) => {
  ctx.deleteMessage();
  await ctx.scene.enter("start");
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

  categoryProducts.push({
    text: "Asosiy menyuga qaytish",
    callback_data: "main_menu",
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

  categoryProducts.push({
    text: "Asosiy menyuga qaytish",
    callback_data: "main_menu",
  });

  const inlineKeyboards = chunkArrayInline(categoryProducts, 1);

  console.log(inlineKeyboards);
  await ctx.editMessageText(`Quyidagi telefon rusumlaridan birini tanlang`, {
    reply_markup: {
      inline_keyboard: inlineKeyboards,
    },
  });
});

scene.action(/^phone_/, async (ctx: any) => {
  const user_id = String(ctx.from?.id);
  const productId = ctx.callbackQuery.data;
  const phoneId = productId.split("_")[1];

  console.log("nimadir");
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
      id: phoneId,
    },
    include: {
      productColorMemory: {
        include: {
          color: true,
          memory: true,
        },
      },
    },
  });

  if (!product) {
    return ctx.reply("Bunday telefon mavjud emas");
  }
  let color: any = [];

  let memory: any = [];

  product.productColorMemory.forEach((item: any) => {
    color.push({
      text: `${item.color.name}`,
      callback_data: `color_${item.id}`,
    });
    memory.push({
      text: `${item.memory.name}GB`,
      callback_data: `memory_${item.id}`,
    });
  });

  console.log(product);

  if (color.length === 0 && memory.length === 0) {
    // const price = (await prisma.mobilePrice.findFirst({
    //   orderBy: {
    //     created_at: "desc",
    //   },
    // })) || {
    //   price: 12700,
    // };

    // const totalPrice = price?.price * product.price;

    // const text = `Siz tanlagan telefon
    //  ${product.name} \n Rangi: ${product.color} Xotirasi: ${
    //   product.memory
    // }GB \n Narxi: ${formatNumber(
    //   totalPrice
    // )} so'm.\nBo'lib to'lash uchun narxlarni ko'rasizmi?`;

    // ctx.editMessageText(text, {
    //   reply_markup: {
    //     inline_keyboard: [
    //       [
    //         {
    //           text: "Ha",
    //           callback_data: `confirm_${phoneId}`,
    //         },
    //         {
    //           text: "Yo'q",
    //           callback_data: `cancel_${phoneId}`,
    //         },
    //       ],
    //       [
    //         {
    //           text: "Bosh sahifaga qaytish",
    //           callback_data: `main_menu`,
    //         },
    //       ],
    //     ],
    //   },
    // });

    await sendProductDetails(
      ctx,
      prisma,
      product,
      product.productColorMemory[0].id,
      "yo'q",
      "yo'q"
    );

    return ctx.scene.enter("installment");
  }

  console.log(color, memory, "next");

  if (color.length == 0) {
    ctx.editMessageText(`Quyidagi xotiralardan birini tanlang`, {
      reply_markup: {
        inline_keyboard: chunkArrayInline(memory, 1),
      },
    });
  }

  if (memory.length == 0) {
    ctx.editMessageText(`Quyidagi ranglardan birini tanlang`, {
      reply_markup: {
        inline_keyboard: chunkArrayInline(color, 1),
      },
    });
  }

  if (color.length != 0 && memory.length != 0) {
    await ctx.editMessageText(`Quyidagi xotiralardan birini tanlang`, {
      reply_markup: {
        inline_keyboard: chunkArrayInline(color, 2),
      },
    });
  }

  return ctx.scene.enter("colorandmemory");
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
      text: `${item.name}`,
      callback_data: `phone_${item.id}`,
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

export async function sendProductDetails(
  ctx: any,
  prisma: any,
  product: any,
  phoneId: string,
  color: string,
  memory: string
) {
  const price = (await prisma.mobilePrice.findFirst({
    orderBy: {
      created_at: "desc",
    },
  })) || {
    price: 12700,
  };

  const totalPrice = price?.price * product.price;

  const text = `Siz tanlagan telefon
   ${
     product.name
   } \n Rangi: ${color} Xotirasi: ${memory}GB \n Narxi: ${formatNumber(
    totalPrice
  )} so'm.\nBo'lib to'lash uchun narxlarni ko'rasizmi?`;

  ctx.editMessageText(text, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Ha",
            callback_data: `confirm_${phoneId}`,
          },
          {
            text: "Yo'q",
            callback_data: `cancel_${phoneId}`,
          },
        ],
        [
          {
            text: "Bosh sahifaga qaytish",
            callback_data: `main_menu`,
          },
        ],
      ],
    },
  });

  // return ctx.scene.enter("installment");
}
export default scene;
