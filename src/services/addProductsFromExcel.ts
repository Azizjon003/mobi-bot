// const XLSX = require("xlsx");
// const path = require("path");
import XLSX from "xlsx";
import path from "path";
import prisma from "../../prisma/prisma";
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

const addProductsFromExcel = async () => {
  for (let i = 0; i < categories.length; i++) {
    const filePath = path.resolve(__dirname, `../data/test${i + 2}.xlsx`);

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
    let category = await prisma.category.findFirst({
      where: {
        name: categories[i].trim(),
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categories[i],
        },
      });
      // return console.log("Category not found");
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

      if (phone?.color) {
        color = await prisma.color.findFirst({
          where: {
            name: phone?.color.trim(),
            productId: product.id,
          },
        });

        if (!color) {
          color = await prisma.color.create({
            data: {
              name: phone.color.trim(),
              productId: product.id,
            },
          });
        }
      }
      let memory;
      if (phone?.memory) {
        memory = await prisma.memory.findFirst({
          where: {
            name: String(phone.memory).trim(),
            productId: product.id,
          },
        });

        if (!memory) {
          memory = await prisma.memory.create({
            data: {
              name: String(phone.memory).trim(),
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
  }
};

addProductsFromExcel();
