"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendProductDetails = void 0;
const telegraf_1 = require("telegraf");
const prisma_1 = __importDefault(require("../../prisma/prisma"));
const keyboards_1 = require("../utils/keyboards");
const helper_1 = require("../lib/helper");
const scene = new telegraf_1.Scenes.BaseScene("phones");
scene.hears("/start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ctx.scene.enter("start");
}));
scene.action(["main_menu", /^cancel/], (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.deleteMessage();
    yield ctx.scene.enter("start");
}));
scene.action(/^next_/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const callbackData = ctx.callbackQuery.data;
    const categoryId = callbackData.split("_")[1];
    const page = Number(callbackData.split("_")[2]);
    console.log(callbackData);
    let categoryDatas = yield getPaginatedProducts(prisma_1.default, categoryId, page, 4);
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
    const inlineKeyboards = (0, keyboards_1.chunkArrayInline)(categoryProducts, 1);
    console.log(inlineKeyboards);
    yield ctx.editMessageText(`Quyidagi telefon rusumlaridan birini tanlang`, {
        reply_markup: {
            inline_keyboard: inlineKeyboards,
        },
    });
}));
scene.action(/^prev/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const callbackData = ctx.callbackQuery.data;
    const categoryId = callbackData.split("_")[1];
    const page = Number(callbackData.split("_")[2]);
    console.log(callbackData);
    let categoryDatas = yield getPaginatedProducts(prisma_1.default, categoryId, page, 4);
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
    const inlineKeyboards = (0, keyboards_1.chunkArrayInline)(categoryProducts, 1);
    console.log(inlineKeyboards);
    yield ctx.editMessageText(`Quyidagi telefon rusumlaridan birini tanlang`, {
        reply_markup: {
            inline_keyboard: inlineKeyboards,
        },
    });
}));
scene.action(/^phone_/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user_id = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    const productId = ctx.callbackQuery.data;
    const phoneId = productId.split("_")[1];
    console.log("nimadir");
    const user = yield prisma_1.default.user.findFirst({
        where: {
            telegram_id: user_id,
        },
    });
    if (!user) {
        return ctx.reply("Siz ro'yxatdan o'tmagansiz. Iltimos, /start buyrug'ini bosing");
    }
    const product = yield prisma_1.default.product.findFirst({
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
    let color = [];
    let memory = [];
    product.productColorMemory.forEach((item) => {
        var _a, _b;
        if (item === null || item === void 0 ? void 0 : item.color)
            color.push({
                text: `${(_a = item === null || item === void 0 ? void 0 : item.color) === null || _a === void 0 ? void 0 : _a.name}`,
                callback_data: `color_${item.id}`,
            });
        if (item === null || item === void 0 ? void 0 : item.memory)
            memory.push({
                text: `${(_b = item === null || item === void 0 ? void 0 : item.memory) === null || _b === void 0 ? void 0 : _b.name}GB`,
                callback_data: `memory_${item.id}`,
            });
    });
    console.log(product.productColorMemory, memory);
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
        yield sendProductDetails(ctx, prisma_1.default, product, product.productColorMemory[0].id, "yo'q", "yo'q");
        return ctx.scene.enter("installment");
    }
    console.log(color, memory, "next");
    if (color.length == 0) {
        ctx.editMessageText(`Quyidagi xotiralardan birini tanlang`, {
            reply_markup: {
                inline_keyboard: (0, keyboards_1.chunkArrayInline)(memory, 1),
            },
        });
    }
    if (memory.length == 0) {
        ctx.editMessageText(`Quyidagi ranglardan birini tanlang`, {
            reply_markup: {
                inline_keyboard: (0, keyboards_1.chunkArrayInline)(color, 1),
            },
        });
    }
    if (color.length != 0 && memory.length != 0) {
        yield ctx.editMessageText(`Quyidagi xotiralardan birini tanlang`, {
            reply_markup: {
                inline_keyboard: (0, keyboards_1.chunkArrayInline)(color, 2),
            },
        });
    }
    return ctx.scene.enter("colorandmemory");
}));
scene.action(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const user_id = String((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id);
    const categoryId = ctx.callbackQuery.data;
    const user = yield prisma_1.default.user.findFirst({
        where: {
            telegram_id: user_id,
        },
    });
    if (!user) {
        return ctx.reply("Siz ro'yxatdan o'tmagansiz. Iltimos, /start buyrug'ini bosing");
    }
    const getCategory = yield prisma_1.default.category.findFirst({
        where: {
            id: categoryId,
        },
    });
    if (!getCategory) {
        return ctx.reply("Bunday kategoriya mavjud emas");
    }
    let categoryDatas = yield getPaginatedProducts(prisma_1.default, categoryId, 1, 4);
    const total = categoryDatas.total;
    const categoryProducts = categoryDatas.products;
    if (total > 4)
        categoryProducts.push({
            text: "Keyingi sahifa",
            callback_data: `next_${categoryId}_2`,
        });
    const inlineKeyboards = (0, keyboards_1.chunkArrayInline)(categoryProducts, 1);
    console.log(inlineKeyboards);
    yield ctx.editMessageText(`Quyidagi telefon rusumlaridan birini tanlang`, {
        reply_markup: {
            inline_keyboard: inlineKeyboards,
        },
    });
}));
function getPaginatedProducts(prisma, categoryId, page, pageSize) {
    return __awaiter(this, void 0, void 0, function* () {
        const skip = (page - 1) * pageSize;
        const products = (yield prisma.product.findMany({
            where: {
                category_id: categoryId,
            },
            take: pageSize,
            skip: skip,
        })).map((item) => {
            return {
                text: `${item.name}`,
                callback_data: `phone_${item.id}`,
            };
        });
        const totalCount = yield prisma.product.count({
            where: {
                category_id: categoryId,
            },
        });
        return {
            products,
            total: totalCount,
        };
    });
}
function sendProductDetails(ctx, prisma, product, phoneId, color, memory) {
    return __awaiter(this, void 0, void 0, function* () {
        const price = (yield prisma.mobilePrice.findFirst({
            orderBy: {
                created_at: "desc",
            },
        })) || {
            price: 12700,
        };
        const totalPrice = (price === null || price === void 0 ? void 0 : price.price) * product.price;
        const text = `Siz tanlagan telefon
   ${product.name} \n Rangi: ${color} Xotirasi: ${memory}GB \n Narxi: ${(0, helper_1.formatNumber)(totalPrice)} so'm.\nBo'lib to'lash uchun narxlarni ko'rasizmi?`;
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
    });
}
exports.sendProductDetails = sendProductDetails;
exports.default = scene;
