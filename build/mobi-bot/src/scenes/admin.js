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
const scene = new telegraf_1.Scenes.BaseScene("admin");
scene.hears("/start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ctx.scene.enter("start");
}));
scene.hears("Userlarni ko'rish", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const usersCount = yield prisma_1.default.user.count();
    const newUsersCount = yield prisma_1.default.user.count({
        where: {
            created_at: {
                gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            },
        },
    });
    ctx.reply(`Botimizda ${usersCount} ta foydalanuvchi bor\n24 soat ichida ${newUsersCount} ta yangi foydalanuvchi ro'yxatdan o'tgan`);
}));
scene.hears("Faol foydalanuvchilar", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma_1.default.user.findMany({
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
}));
scene.hears("Mahsulotlar soni", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield prisma_1.default.product.count();
    const newProducts = yield prisma_1.default.product.count({
        where: {
            created_at: {
                gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            },
        },
    });
    ctx.reply(`Botimizda ${products} ta mahsulot bor\n24 soat ichida ${newProducts} ta yangi mahsulot qo'shilgan`);
}));
scene.hears("Foydalanuvchilarga xabar yuborish", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply("Xabar matnini kiriting.Agar xabarni bekor qilmoqchi bo'lsangiz /start ni bosing");
    ctx.scene.enter("send_message");
}));
exports.default = scene;
