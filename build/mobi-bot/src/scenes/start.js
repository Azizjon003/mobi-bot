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
exports.keyboards = void 0;
const telegraf_1 = require("telegraf");
const enabled_1 = __importDefault(require("../utils/enabled"));
const control_1 = require("./control");
const prisma_1 = __importDefault(require("../../prisma/prisma"));
const keyboards_1 = require("../utils/keyboards");
const keyboard = [
    ["Userlarni ko'rish", "Faol foydalanuvchilar"],
    ["Mahsulotlar soni"],
    ["Foydalanuvchilarga xabar yuborish"],
];
exports.keyboards = [];
const scene = new telegraf_1.Scenes.BaseScene("start");
scene.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user_id = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    const isEnabled = yield (0, enabled_1.default)(user_id, ctx.from.first_name);
    if (isEnabled === "one") {
        ctx.telegram.sendMessage(user_id, `Assalomu alaykum, ${ctx.from.first_name}!
    Telefon raqamingizni yuboring.Telefon raqamingizni kiriting Misol uchun: +998901234567
    `, {
            reply_markup: {
            // keyboard: [
            //   [{ text: "Telefon raqamni yuborish", request_contact: true }],
            // ],
            // resize_keyboard: true,
            },
        });
        return yield ctx.scene.enter("control");
    }
    else if (isEnabled === "four") {
        yield (0, control_1.sendCategories)(ctx, prisma_1.default, keyboards_1.chunkArrayInline);
        return yield ctx.scene.enter("phones");
    }
    else if (isEnabled === "two") {
        ctx.reply("Assalomu alaykum admin xush kelibsiz", {
            reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true,
            },
        });
        return yield ctx.scene.enter("admin");
    }
}));
exports.default = scene;
