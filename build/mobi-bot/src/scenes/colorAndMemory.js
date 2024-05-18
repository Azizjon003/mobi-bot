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
const phones_1 = require("./phones");
const scene = new telegraf_1.Scenes.BaseScene("colorandmemory");
scene.action(/^color_/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const telegramId = String((_a = ctx === null || ctx === void 0 ? void 0 : ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    const user = yield prisma_1.default.user.findFirst({
        where: {
            telegram_id: telegramId,
        },
    });
    if (!user) {
        console.log("user ");
        return yield ctx.scene.enter("start");
    }
    const callbackData = ctx.callbackQuery.data;
    const colorId = callbackData.split("_")[1];
    const colorAndMemory = yield prisma_1.default.productColorMemory.findFirst({
        where: {
            id: String(colorId),
        },
        include: {
            memory: true,
            color: true,
        },
    });
    if (!colorAndMemory) {
        yield ctx.reply("Xatolik yuz berdi");
        return yield ctx.scene.enter("start");
    }
    let product = yield prisma_1.default.product.findFirst({
        where: {
            id: colorAndMemory.productId,
        },
        include: {
            productColorMemory: {
                include: {
                    color: true,
                    memory: true,
                },
                where: {
                    colorId: colorAndMemory.colorId,
                },
            },
        },
    });
    if (!product) {
        yield ctx.reply("Xatolik yuz berdi");
        return yield ctx.scene.enter("start");
    }
    let memory = [];
    product.productColorMemory.forEach((item) => {
        memory.push({
            text: `${item.memory.name}GB`,
            callback_data: `memory_${item.id}`,
        });
    });
    if (memory.length === 0) {
        yield (0, phones_1.sendProductDetails)(ctx, prisma_1.default, product, colorId, ((_b = colorAndMemory === null || colorAndMemory === void 0 ? void 0 : colorAndMemory.color) === null || _b === void 0 ? void 0 : _b.name) || "yo'q", "Yo'q");
        return ctx.scene.enter("installment");
    }
    const keyboard = (0, keyboards_1.chunkArrayInline)(memory, 2);
    keyboard.push([{ text: "Orqaga", callback_data: `back` }]);
    yield ctx.reply("Xotirani tanlang", {
        reply_markup: {
            inline_keyboard: keyboard,
        },
    });
}));
scene.action(/^memory_/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const user = yield prisma_1.default.user.findFirst({
        where: {
            telegram_id: String(ctx.from.id),
        },
    });
    if (!user) {
        return yield ctx.scene.enter("start");
    }
    const callbackData = ctx.callbackQuery.data;
    const memoryId = callbackData.split("_")[1];
    const colorAndMemory = yield prisma_1.default.productColorMemory.findFirst({
        where: {
            id: String(memoryId),
        },
        include: {
            color: true,
            memory: true,
        },
    });
    if (!colorAndMemory) {
        yield ctx.reply("Xatolik yuz berdi");
        return yield ctx.scene.enter("start");
    }
    let product = yield prisma_1.default.product.findFirst({
        where: {
            id: colorAndMemory.productId,
        },
        include: {
            productColorMemory: {
                include: {
                    color: true,
                    memory: true,
                },
                where: {
                    memoryId: colorAndMemory.memoryId,
                },
            },
        },
    });
    if (!product) {
        yield ctx.reply("Xatolik yuz berdi");
        return yield ctx.scene.enter("start");
    }
    yield (0, phones_1.sendProductDetails)(ctx, prisma_1.default, product, memoryId, ((_c = colorAndMemory === null || colorAndMemory === void 0 ? void 0 : colorAndMemory.color) === null || _c === void 0 ? void 0 : _c.name) || "Yo'q", ((_d = colorAndMemory === null || colorAndMemory === void 0 ? void 0 : colorAndMemory.memory) === null || _d === void 0 ? void 0 : _d.name) || "yo'q");
    return ctx.scene.enter("installment");
}));
scene.hears("/start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ctx.scene.enter("start");
}));
exports.default = scene;
