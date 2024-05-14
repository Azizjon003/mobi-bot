import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { chunkArrayInline, keyboards } from "../utils/keyboards";
import { callback } from "telegraf/typings/button";
import { inlineKeyboard } from "telegraf/typings/markup";
const scene = new Scenes.BaseScene("admin");

scene.hears("/start", async (ctx: any) => {
  return await ctx.scene.enter("start");
});

export default scene;
