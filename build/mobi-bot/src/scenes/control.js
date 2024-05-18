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
exports.sendCategories = void 0;
const telegraf_1 = require("telegraf");
const prisma_1 = __importDefault(require("../../prisma/prisma"));
const keyboards_1 = require("../utils/keyboards");
const scene = new telegraf_1.Scenes.BaseScene("control");
scene.hears("/start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ctx.scene.enter("start");
}));
scene.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const phone = ctx.message.text;
    const uzbekPhoneRegex = /(?:\+?998|8) ?\d{2} ?\d{3} ?\d{2} ?\d{2}/;
    if (!uzbekPhoneRegex.test(phone)) {
        return ctx.reply("Telefon raqamingizni noto'g'ri yubordingiz. Iltimos, qaytadan urinib ko'ring");
    }
    const user_id = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    const user = yield prisma_1.default.user.findFirst({
        where: {
            telegram_id: user_id,
        },
    });
    console.log(user);
    if (!user) {
        return ctx.reply("Siz ro'yxatdan o'tmagansiz. Iltimos, /start buyrug'ini bosing");
    }
    const userUpdate = yield prisma_1.default.user.update({
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
    yield sendCategories(ctx, prisma_1.default, keyboards_1.chunkArrayInline);
    yield ctx.scene.enter("phones");
}));
function sendCategories(ctx, prisma, chunkArrayInline) {
    return __awaiter(this, void 0, void 0, function* () {
        const category = (yield prisma.category.findMany({})).map((item) => {
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
    });
}
exports.sendCategories = sendCategories;
scene.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply("Iltimos, telefon raqamingizni yuboring");
}));
exports.default = scene;
