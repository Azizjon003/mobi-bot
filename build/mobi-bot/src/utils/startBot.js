"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botStart = (bot) => {
    bot.launch().then(() => {
        console.log("Aziz");
    });
    console.log(`Bot Azizjon has been started...`);
};
exports.default = botStart;
