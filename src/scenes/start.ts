import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import { sendCategories } from "./control";
import prisma from "../../prisma/prisma";
import { chunkArrayInline } from "../utils/keyboards";

export const keyboards = [];
const scene = new Scenes.BaseScene("start");
scene.enter(async (ctx: any) => {
  const user_id = String(ctx.from?.id);

  const isEnabled = await enabled(user_id, ctx.from.first_name);

  if (isEnabled === "one") {
    ctx.telegram.sendMessage(
      user_id,
      `Assalomu alaykum, ${ctx.from.first_name}!
    Telefon raqamingizni yuboring:
    `,
      {
        reply_markup: {
          keyboard: [
            [{ text: "Telefon raqamni yuborish", request_contact: true }],
          ],
          resize_keyboard: true,
        },
      }
    );

    return await ctx.scene.enter("control");
  } else if (isEnabled === "four") {
    await sendCategories(ctx, prisma, chunkArrayInline);
    return await ctx.scene.enter("phones");
  }
});

export default scene;
