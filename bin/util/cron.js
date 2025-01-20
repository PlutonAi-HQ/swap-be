var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { transfer } from "./contract";
const cron = require('node-cron');
export const schedule = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date(data.date);
    console.log(date);
    console.log(`* ${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`);
    cron.schedule(`${date.getSeconds()} ${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`, (date) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`Transfer at ${date}`);
        const result = yield transfer(data.recipient, data.amount);
        console.log(`Transfer at ${date} \nTransfer result:`, result);
    }));
});
