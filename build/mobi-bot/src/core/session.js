"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("@telegraf/session/redis");
const store = (0, redis_1.Redis)({
    url: "redis://127.0.0.1:6379",
});
// const sessionStorage = ;
const { session: memorySession } = require("telegraf");
const session = memorySession({});
// const session = new RedisSession({
//   store: {
//     host: "127.0.0.1",
//     port: 6379,
//   },
// });
exports.default = session;
