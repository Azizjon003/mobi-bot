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
const telegraf_1 = require("telegraf");
const prisma_1 = __importDefault(require("../../prisma/prisma"));
const keyboards_1 = require("../utils/keyboards");
const helper_1 = require("../lib/helper");
const scene = new telegraf_1.Scenes.BaseScene("installment");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pdfmake_1 = __importDefault(require("pdfmake"));
const Printer = new pdfmake_1.default({
    Roboto: {
        normal: "fonts/Roboto-Italic.ttf",
    },
});
scene.action(["main_menu", /^cancel/], (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.deleteMessage();
    yield ctx.scene.enter("start");
}));
scene.action(/^confirm/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const callbackData = ctx.callbackQuery.data;
    const productId = callbackData.split("_")[1];
    const user_id = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    // await ctx.deleteMessage();
    const user = yield prisma_1.default.user.findFirst({
        where: {
            telegram_id: user_id,
        },
    });
    if (!user) {
        return ctx.reply("Siz ro'yxatdan o'tmagansiz. Iltimos, /start buyrug'ini bosing");
    }
    const product = yield prisma_1.default.productColorMemory.findFirst({
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
}));
scene.action(/^per_/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    const callbackData = ctx.callbackQuery.data;
    const percentage = callbackData.split("_")[1];
    const productId = callbackData.split("_")[2];
    const user_id = String((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id);
    const user = yield prisma_1.default.user.findFirst({
        where: {
            telegram_id: user_id,
        },
    });
    if (!user) {
        return ctx.reply("Siz ro'yxatdan o'tmagansiz. Iltimos, /start buyrug'ini bosing");
    }
    const product = yield prisma_1.default.productColorMemory.findFirst({
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
    const price = (yield prisma_1.default.mobilePrice.findFirst({
        orderBy: {
            created_at: "desc",
        },
    })) || {
        price: 12700,
    };
    const totalPrice = (price === null || price === void 0 ? void 0 : price.price) * product.price;
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
        "Foydalanuvchi: " + (user === null || user === void 0 ? void 0 : user.name),
        "telefon raqami: " + (user === null || user === void 0 ? void 0 : user.phone),
        "Telefon: " + product.product.name,
        "Xotira: " + ((_c = product === null || product === void 0 ? void 0 : product.memory) === null || _c === void 0 ? void 0 : _c.name) || "",
        "Rang: " + ((_d = product === null || product === void 0 ? void 0 : product.color) === null || _d === void 0 ? void 0 : _d.name) || "",
        "Narxi: " + (0, helper_1.formatNumber)(price.price * product.price) + " so'm",
        ...prices,
    ];
    const pathPdf = path_1.default.join(__dirname, `${user.telegram_id}.pdf`);
    const createPdfPath = yield createPdf(textArray, pathPdf);
    const dtd = fs_1.default.readFileSync(pathPdf);
    yield ctx.telegram.sendDocument("-1002061335019", {
        source: dtd,
        filename: `${user.telegram_id}.pdf`,
    }, {
        caption: `
      Kim tomonidan yuborildi <a href="tg://user?id=${user.telegram_id}">${user.id}</a>\
      Foydalanuvchi : ${user.name} \n Telefon : ${user.phone} \n Rusumi : ${product.product.name}\n ${text} `,
        parse_mode: "HTML",
    });
    fs_1.default.unlinkSync(pathPdf);
    yield prisma_1.default.order.create({
        data: {
            user_id: user.id,
            product_color_id: product.id,
            initial_price: totalPrice * percentage,
            price: totalPrice,
        },
    });
}));
let initPercentageKeyboard = (initPercentage, itemId) => {
    return (0, keyboards_1.chunkArrayInline)(initPercentage.map((item) => {
        return {
            text: `${item}%`,
            callback_data: `per_${item}_${itemId}`,
        };
    }), 2);
};
const priceCalcFunk = (price, percentage) => {
    let month = [3, 6, 12];
    let prices = [];
    let text = `Siz tanlagan to'lov ${percentage}% bo'yicha quyidagicha to'lashingiz mumkin:\n`;
    for (let mon of month) {
        let txt = "";
        let corePrice = price - (price * percentage) / 100;
        if (mon === 3) {
            let pricess = corePrice + corePrice * 0.20104;
            txt = `3 oylik to'lov uchun umumiy summa: ${(0, helper_1.formatNumber)(pricess)} so'm\nBo'lib to'lash: ${(0, helper_1.formatNumber)(pricess / 3)} so'm`;
        }
        else if (mon === 6) {
            let pricess = corePrice + corePrice * 0.36757;
            txt = `6 oylik to'lov uchun umumiy summa: ${(0, helper_1.formatNumber)(pricess)} so'm\nBo'lib to'lash: ${(0, helper_1.formatNumber)(pricess / 6)} so'm`;
        }
        else if (mon === 12) {
            let pricess = corePrice + corePrice * 0.74;
            txt = `12 oylik to'lov uchun umumiy summa: ${(0, helper_1.formatNumber)(pricess)} so'm\nBo'lib to'lash: ${(0, helper_1.formatNumber)(pricess / 12)} so'm`;
        }
        prices.push(`${txt}\n`);
        text += txt + "\n\n";
    }
    return {
        text: text,
        prices: prices,
    };
};
function createPdf(content, path) {
    return __awaiter(this, void 0, void 0, function* () {
        let doc = {
            content: content,
            defaultStyle: {
                fontSize: 15,
            },
        };
        const time = new Date().getTime();
        let pdfDoc = Printer.createPdfKitDocument(doc);
        pdfDoc.pipe(fs_1.default.createWriteStream(path));
        pdfDoc.end();
        yield sleep(500);
        return path;
    });
}
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
exports.default = scene;
