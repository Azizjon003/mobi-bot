"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Scenes } = require("telegraf");
const start_1 = __importDefault(require("./start"));
const control_1 = __importDefault(require("./control"));
const phones_1 = __importDefault(require("./phones"));
const admin_1 = __importDefault(require("./admin"));
const installment_1 = __importDefault(require("./installment"));
const colorAndMemory_1 = __importDefault(require("./colorAndMemory"));
const sendMessage_1 = __importDefault(require("./sendMessage"));
const stage = new Scenes.Stage([
    start_1.default,
    control_1.default,
    phones_1.default,
    installment_1.default,
    admin_1.default,
    colorAndMemory_1.default,
    sendMessage_1.default,
]);
exports.default = stage;
