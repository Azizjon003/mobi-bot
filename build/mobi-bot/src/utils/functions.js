"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTitles = exports.parseItems = exports.contentToString = exports.addInlineKeyboard = void 0;
const addInlineKeyboard = (arr) => {
    let left = [];
    for (let i = 0; i < arr.length; i += 2) {
        let arrcha = [];
        let arrcha2 = [];
        let arrcha3 = [];
        if (arr[i].name.length > 25) {
            arrcha2.push({
                text: arr[i].name,
                callback_data: arr[i].id,
            });
        }
        else {
            arrcha.push({
                text: arr[i].name,
                callback_data: arr[i].id,
            });
        }
        if (i + 1 < arr.length) {
            if (arr[i + 1].name.length > 25) {
                arrcha3.push({
                    text: arr[i + 1].name,
                    callback_data: arr[i + 1].id,
                });
            }
            else {
                arrcha.push({
                    text: arr[i + 1].name,
                    callback_data: arr[i + 1].id,
                });
            }
        }
        left.push(arrcha);
        left.push(arrcha2);
        left.push(arrcha3);
    }
    return left;
};
exports.addInlineKeyboard = addInlineKeyboard;
const contentToString = (content, lang) => {
    let text = "";
    console.log(content);
    for (let txt of content) {
        console.log(txt[`${lang}Content`]);
        let description = `<b>${txt === null || txt === void 0 ? void 0 : txt.title}</b>\n
    <i>${txt[`${lang}Content`]}</i>\n
    `;
        text += description;
    }
    return text;
};
exports.contentToString = contentToString;
const parseItems = (dataString) => {
    var _a, _b, _c, _d;
    const titles = (_a = dataString
        .match(/"title": "(.*?)"/g)) === null || _a === void 0 ? void 0 : _a.map((val) => { var _a; return (_a = val.match(/"title": "(.*?)"/)) === null || _a === void 0 ? void 0 : _a[1]; });
    const uzContents = (_b = dataString
        .match(/"uzContent": "(.*?)"/g)) === null || _b === void 0 ? void 0 : _b.map((val) => { var _a; return (_a = val.match(/"uzContent": "(.*?)"/)) === null || _a === void 0 ? void 0 : _a[1]; });
    console.log(titles, uzContents);
    let content = uzContents === null || uzContents === void 0 ? void 0 : uzContents.map((uzContent, index) => {
        return {
            uzContent,
            title: titles === null || titles === void 0 ? void 0 : titles[index],
        };
    });
    // console.log(content);
    const regex = /"title":"(.*?)","uzContent":"(.*?)"/g;
    let match;
    let results = [];
    while ((match = regex.exec(dataString)) !== null) {
        results.push({
            title: match[1],
            uzContent: match[2],
        });
    }
    if (results.length === 0) {
        const titles = (_c = dataString
            .match(/"title": "(.*?)"/g)) === null || _c === void 0 ? void 0 : _c.map((val) => { var _a; return (_a = val.match(/"title": "(.*?)"/)) === null || _a === void 0 ? void 0 : _a[1]; });
        const uzContents = (_d = dataString
            .match(/"uzContent": "(.*?)"/g)) === null || _d === void 0 ? void 0 : _d.map((val) => { var _a; return (_a = val.match(/"uzContent": "(.*?)"/)) === null || _a === void 0 ? void 0 : _a[1]; });
        console.log(titles, uzContents);
        results = uzContents === null || uzContents === void 0 ? void 0 : uzContents.map((uzContent, index) => {
            return {
                uzContent,
                title: titles === null || titles === void 0 ? void 0 : titles[index],
            };
        });
    }
    return results;
};
exports.parseItems = parseItems;
const parseTitles = (rawData) => {
    const regexPattern = /"uzTitle": "(.*?)",\s*"enTitle": "(.*?)"/gs;
    let matches;
    const results = [];
    while ((matches = regexPattern.exec(rawData)) !== null) {
        // Adding matched uzTitle and enTitle to results array
        results.push({
            uzTitle: matches[1],
            enTitle: matches[2],
        });
    }
    return results;
};
exports.parseTitles = parseTitles;
// parseItems(`{"slide":{"name":"Biznes rejasini amalga oshirish uchun kerakli resurslar","content":[{"title":"Moliyaviy resurslar","uzContent":"Biznesni boshqarish uchun moliyaviy resurslar kerak bo'ladi, jumladan arzon mablag'lar, investorlar yoki kreditlar."},
// {"title":"Kadrlar","uzContent":"Biznes faoliyatini amalga oshirish uchun mutaxassis kadrlar kerak bo'ladi. Bu xodimlar, mutaxassislar yoki ko'makchilar bo'lishi mumkin."},
// {"title":"Mashinalar va uskunalar","uzContent":"Biznes uchun kerak bo'lgan mashinalar, texnika va uskunalar moliya va asbob-uskunalar bilan ta'minlanishi kerak."},
// {"title":"Marketing va reklama","uzContent":"Muvaffaqiyatli biznes rejasini amalga oshirish uchun marketing va reklamaning muhim ahamiyati bor. Bu marketing strategiyasi, reklama materiallari va reklama platformalari ni tekshirib chiqishni o'z ichiga oladi."}]}`);
