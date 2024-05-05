const { Scenes } = require("telegraf");
import start from "./start";

import control from "./control";
import phones from "./phones";
const stage = new Scenes.Stage([start, control, phones]);

export default stage;
