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
const prisma_1 = __importDefault(require("../../prisma/prisma"));
const xss_1 = __importDefault(require("xss"));
var enabledEnum;
(function (enabledEnum) {
    enabledEnum["one"] = "one";
    enabledEnum["two"] = "two";
    enabledEnum["three"] = "three";
    enabledEnum["four"] = "four";
})(enabledEnum || (enabledEnum = {}));
const enabled = (id, name) => __awaiter(void 0, void 0, void 0, function* () {
    name = (0, xss_1.default)(name);
    const user = yield prisma_1.default.user.findFirst({
        where: {
            telegram_id: id,
        },
    });
    if (user) {
        if (!user.isActive) {
            return enabledEnum.three;
        }
        if (user.role === "USER") {
            if (user.phone) {
                return enabledEnum.four;
            }
            return enabledEnum.one;
        }
        else if (user.role === "ADMIN") {
            return enabledEnum.two;
        }
        return enabledEnum.one;
    }
    else {
        let user = yield prisma_1.default.user.create({
            data: {
                telegram_id: id,
                name: name,
                username: name,
            },
        });
        return enabledEnum.one;
    }
});
exports.default = enabled;
