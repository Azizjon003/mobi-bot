import prisma from "../../prisma/prisma";

export function formatNumber(num: number) {
  return num.toLocaleString("uz-UZ");
}
