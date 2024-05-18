"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const config_1 = __importDefault(require("../utils/config"));
const bot = new telegraf_1.Telegraf(String(config_1.default.TOKEN));
exports.default = bot;
