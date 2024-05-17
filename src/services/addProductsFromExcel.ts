// const XLSX = require("xlsx");
// const path = require("path");
import XLSX from "xlsx";
import path from "path";
import prisma from "../../prisma/prisma";
// Faylni o'qish uchun yo'lni ko'rsatamiz
const filePath = path.resolve(__dirname, "../data/test3.xlsx");

// Faylni ochamiz
const workbook = XLSX.readFile(filePath);

// Birinchi ish varag'ini o'qiyapmiz
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Ma'lumotlarni JSON formatiga o'tkazamiz
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Telefonlar haqidagi ma'lumotlarni saqlash uchun yangi massiv
const phones: any = data
  .slice(1)
  .map((row: any) => {
    if (row[0]) {
      return {
        name: row[0],
        memory: row[1],
        color: row[2],
        price: row[3],
      };
    }
  })
  .filter((phone: any) => phone);

// Ma'lumotlarni ko'rsatamiz
console.log(phones);

const addProductsFromExcel = async () => {
  const category = await prisma.category.findFirst({
    where: {
      id: "1145d9ba-80f0-43ef-8dc9-48d17ce20d36",
    },
  });

  if (!category) {
    return console.log("Category not found");
  }

  await prisma.product.deleteMany({
    where: {
      category_id: category.id,
    },
  });
  let count = 0;
  for (const phone of phones) {
    const product = await prisma.product.upsert({
      where: {
        name: String(phone.name),
      },
      update: {},
      create: {
        name: String(phone.name),
        // memory: String(phone.memory),
        // color: String(phone.color),
        price: phone.price,
        category_id: category.id,
      },
    });
    let color;

    if (phone?.color) {
      color = await prisma.color.findFirst({
        where: {
          name: phone.color,
          productId: product.id,
        },
      });

      if (!color) {
        color = await prisma.color.create({
          data: {
            name: phone.color,
            productId: product.id,
          },
        });
      }
    }
    let memory;
    if (phone?.memory) {
      memory = await prisma.memory.findFirst({
        where: {
          name: phone.memory,
          productId: product.id,
        },
      });

      if (!memory) {
        memory = await prisma.memory.create({
          data: {
            name: phone.memory,
            productId: product.id,
          },
        });
      }
    }

    const productMemory = await prisma.productColorMemory.create({
      data: {
        productId: product.id,
        colorId: color?.id,
        memoryId: memory?.id,
        price: phone.price,
      },
    });

    count++;
  }

  console.log(`${count} products added`);
};

addProductsFromExcel();
