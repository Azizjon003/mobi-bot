const { Scenes } = require("telegraf");
import start from "./start";

import control from "./control";
import phones from "./phones";
import installment from "./installment";
const stage = new Scenes.Stage([start, control, phones, installment]);

export default stage;
