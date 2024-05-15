const { Scenes } = require("telegraf");
import start from "./start";

import control from "./control";
import phones from "./phones";
import admin from "./admin";
import installment from "./installment";
import colorandmemory from "./colorAndMemory";
const stage = new Scenes.Stage([
  start,
  control,
  phones,
  installment,
  admin,
  colorandmemory,
]);

export default stage;
