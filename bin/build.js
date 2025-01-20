var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { execSync } from 'child_process';
import { getModuleFunctions } from './util/contract';
import { schedule } from './util/cron';
const sui = `${__dirname}/../sui/sui`;
export function publishContract() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('start to publish contract');
        // contract directory
        const contractPath = `${__dirname}/../contract`;
        try {
            // publish contract by cli command
            const buildResults = execSync(`${sui} client publish ${contractPath}`, { encoding: 'utf-8' });
            // get packageId from buildResults string
            const packageId = buildResults.split('PackageID: ')[1].split('Version')[0].substring(0, 66);
            // get functions from packageId
            const functions = yield getModuleFunctions(packageId);
            return {
                status: false,
                message: 'publish successfull',
                functions: functions
            };
        }
        catch (error) {
            console.log('publish fail! error', error);
            if (error.stderr != '') {
                return {
                    status: true,
                    message: error.stderr
                };
            }
            else {
                return {
                    status: true,
                    message: error.stdout
                };
            }
        }
    });
}
function saveCode(code) {
    return __awaiter(this, void 0, void 0, function* () {
        // save code to contract/sources/contract.move
        const fs = require('fs');
        fs.writeFileSync(`${__dirname}/../contract/sources/contract.move`, code);
    });
}
export function buildContract(code) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('start to build contract');
        yield saveCode(code);
        // get contract directory
        const contractPath = `${__dirname}/../contract`;
        try {
            // build contract by cli command
            const buildResults = execSync(`${sui} move build --dump-bytecode-as-base64 --path ${contractPath}`, { encoding: 'utf-8' });
            return {
                status: false,
                message: 'compile successfull',
                buildResults: JSON.parse(buildResults) //format buildResults
            };
        }
        catch (error) {
            console.log('compile fail! error', error);
            if (error.stderr != '') {
                return {
                    status: true,
                    message: error.stderr
                };
            }
            else {
                return {
                    status: true,
                    message: error.stdout
                };
            }
        }
    });
}
export function transferSchedule(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Call compile function
        yield schedule(data);
        return {
            status: true,
            message: 'schedule successfull',
            receipt: `Transfer ${data.amount} to ${data.recipient} at ${data.date}`
        };
    });
}
export function smartSwap(recipient, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        // Call compile function
        // get current price
    });
}
