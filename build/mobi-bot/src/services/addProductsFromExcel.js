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
// const XLSX = require("xlsx");
// const path = require("path");
const xlsx_1 = __importDefault(require("xlsx"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("../../prisma/prisma"));
// Faylni o'qish uchun yo'lni ko'rsatamiz
const categories = [
    "Samsung",
    "Redmi",
    "Tecno",
    "Infinix",
    "Iphone e-sim",
    "Iphone sim",
    "Honor",
];
const addProductsFromExcel = () => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < categories.length; i++) {
        const filePath = path_1.default.resolve(__dirname, `../data/test${i + 2}.xlsx`);
        // Faylni ochamiz
        const workbook = xlsx_1.default.readFile(filePath);
        // Birinchi ish varag'ini o'qiyapmiz
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Ma'lumotlarni JSON formatiga o'tkazamiz
        const data = xlsx_1.default.utils.sheet_to_json(sheet, { header: 1 });
        // Telefonlar haqidagi ma'lumotlarni saqlash uchun yangi massiv
        const phones = data
            .slice(1)
            .map((row) => {
            if (row[0]) {
                return {
                    name: row[0],
                    memory: row[1],
                    color: row[2],
                    price: row[3],
                };
            }
        })
            .filter((phone) => phone);
        // Ma'lumotlarni ko'rsatamiz
        let category = yield prisma_1.default.category.findFirst({
            where: {
                name: categories[i].trim(),
            },
        });
        if (!category) {
            category = yield prisma_1.default.category.create({
                data: {
                    name: categories[i],
                },
            });
            // return console.log("Category not found");
        }
        yield prisma_1.default.product.deleteMany({
            where: {
                category_id: category.id,
            },
        });
        let count = 0;
        for (const phone of phones) {
            const product = yield prisma_1.default.product.upsert({
                where: {
                    name: String(phone.name).trim(),
                },
                update: {},
                create: {
                    name: String(phone.name).trim(),
                    // memory: String(phone.memory),
                    // color: String(phone.color),
                    price: phone.price,
                    category_id: category.id,
                },
            });
            let color;
            if (phone === null || phone === void 0 ? void 0 : phone.color) {
                color = yield prisma_1.default.color.findFirst({
                    where: {
                        name: phone === null || phone === void 0 ? void 0 : phone.color.trim(),
                        productId: product.id,
                    },
                });
                if (!color) {
                    color = yield prisma_1.default.color.create({
                        data: {
                            name: phone.color.trim(),
                            productId: product.id,
                        },
                    });
                }
            }
            let memory;
            if (phone === null || phone === void 0 ? void 0 : phone.memory) {
                memory = yield prisma_1.default.memory.findFirst({
                    where: {
                        name: String(phone.memory).trim(),
                        productId: product.id,
                    },
                });
                if (!memory) {
                    memory = yield prisma_1.default.memory.create({
                        data: {
                            name: String(phone.memory).trim(),
                            productId: product.id,
                        },
                    });
                }
            }
            const productMemory = yield prisma_1.default.productColorMemory.create({
                data: {
                    productId: product.id,
                    colorId: color === null || color === void 0 ? void 0 : color.id,
                    memoryId: memory === null || memory === void 0 ? void 0 : memory.id,
                    price: phone.price,
                },
            });
            count++;
        }
        console.log(`${count} products added`);
    }
});
addProductsFromExcel();
