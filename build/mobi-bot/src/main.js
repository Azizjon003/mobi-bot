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
require("dotenv").config();
const bot_1 = __importDefault(require("./core/bot"));
const session_1 = __importDefault(require("./core/session"));
const startBot_1 = __importDefault(require("./utils/startBot"));
const index_1 = __importDefault(require("./scenes/index"));
bot_1.default.use(session_1.default);
const middleware = (ctx, next) => {
    var _a;
    (_a = ctx === null || ctx === void 0 ? void 0 : ctx.session) !== null && _a !== void 0 ? _a : (ctx.session = {});
};
bot_1.default.use(index_1.default.middleware());
bot_1.default.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ctx.scene.enter("start");
}));
bot_1.default.catch((err, ctx) => {
    var _a;
    const userId = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    if (userId) {
        bot_1.default.telegram.sendMessage(userId, "Xatolik yuz berdi. Iltimos qayta urinib ko'ring\n /start buyrug'ini bosib qayta urunib ko'ring");
    }
    console.log(err);
    console.log(`Ooops, encountered an error for ${ctx}`, err);
});
(0, startBot_1.default)(bot_1.default);
https: process.on("unhandledRejection", (reason, promise) => {
    console.error("Ushlanmagan rad etilgan va'da:", promise, "Sabab:");
});
process.on("uncaughtException", (error) => {
    console.error("Ushlanmagan istisno:", error);
});
