const { Scenes } = require("telegraf");
import start from "./start";

import control from "./control";
import phones from "./phones";
import admin from "./admin";
import installment from "./installment";
import colorandmemory from "./colorAndMemory";
import sendMessage from "./sendMessage";
import prisma from "../../prisma/prisma";
const stage = new Scenes.Stage([
  start,
  control,
  phones,
  installment,
  admin,
  colorandmemory,
  sendMessage,
]);

export default stage;
