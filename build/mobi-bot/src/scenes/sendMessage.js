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
const scene = new telegraf_1.Scenes.BaseScene("send_message");
const xss_1 = __importDefault(require("xss"));
scene.hears("/start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ctx.scene.enter("start");
}));
scene.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const users = yield prisma_1.default.user.findMany();
    for (let user of users) {
        const userNameClean = (0, xss_1.default)((_a = user.username) !== null && _a !== void 0 ? _a : "Anonymous");
        try {
            yield ctx.telegram.sendMessage(user.telegram_id, ctx.message.text, {
                parse_mode: "HTML",
            });
            yield delay(1000);
        }
        catch (error) {
            console.log(error);
            ctx.reply(`Xabar yuborishda xatolik yuz berdi <a href="tg://user?id=${user.telegram_id}">${userNameClean}</a> foydalanvchi `, {
                parse_mode: "HTML",
            });
        }
    }
    ctx.reply("Xabar barcha foydalanuvchilarga yuborildi.\n Qanday xizmatlar bor menga admin :)");
    return yield ctx.scene.enter("start");
}));
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
exports.default = scene;
