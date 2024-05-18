"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkArrayInline = exports.createInlineKeyboard = exports.keyboards = void 0;
const telegraf_1 = require("telegraf");
const keyboards = (arr) => {
    let keyboard = telegraf_1.Markup.keyboard(arr)
        .resize()
        .oneTime()
        .placeholder("Filialni tanlang");
    return keyboard;
};
exports.keyboards = keyboards;
function createInlineKeyboard(buttons) {
    return telegraf_1.Markup.inlineKeyboard(buttons.map((button) => telegraf_1.Markup.button.callback(button.text, button.callbackData)));
}
exports.createInlineKeyboard = createInlineKeyboard;
function chunkArrayInline(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}
exports.chunkArrayInline = chunkArrayInline;
