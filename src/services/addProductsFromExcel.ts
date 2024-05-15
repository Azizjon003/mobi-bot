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
      id: "91b34cf1-a878-4e0d-975d-ef2c7bec3382",
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
    const product = await prisma.product.create({
      data: {
        name: String(phone.name),
        // memory: String(phone.memory),
        // color: String(phone.color),
        price: phone.price,
        category_id: category.id,
      },
    });
    count++;
  }

  console.log(`${count} products added`);
};

addProductsFromExcel();
