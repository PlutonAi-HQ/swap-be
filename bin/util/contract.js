var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { callGraphql } from "./graphql";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { fromHEX } from '@mysten/sui.js/utils';
export const parseCode = (code, packageId) => {
    try {
        // split to get the entry functions
        const arr = code.split('entry public ');
        // get function names by handling string
        const function_names = arr.map((item, index) => {
            if (index !== 0)
                return item.split('(')[0];
        }).filter(item => item !== undefined);
        // get function arguments by handling string
        const function_args = arr.map((item, index) => {
            if (index !== 0)
                return item.split('(')[1].split(')')[0];
        }).filter(item => item !== undefined);
        // format function names and arguments
        const compile = function_names.map((item, index) => {
            var _a;
            return {
                name: `${packageId}::contract::${item}`,
                args: (_a = function_args[index]) === null || _a === void 0 ? void 0 : _a.split(',').map(item => item.split(':')[1].trim()).filter(item => item !== '&mut TxContext')
            };
        });
        return compile;
    }
    catch (error) {
        console.log('parse code error', error);
        return [];
    }
};
export const getModuleFunctions = (packageId) => __awaiter(void 0, void 0, void 0, function* () {
    // get modules from packageId string by graphql
    const query = `
      query Package {
        package(
            address: "${packageId}"
        ) {
          
            module(name: "contract") {
                name
                bytes
                disassembly
                
            }
            
        }
    }
    `;
    const data = yield callGraphql(query);
    // get code from data
    const code = data.data.package.module.disassembly;
    // handle convert code to functions
    const compile = parseCode(code, packageId);
    return compile;
});
export function transfer(recipient, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize provider with desired network
        // Set up the signer with private key
        if (!process.env.PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY environment variable is not defined");
        }
        const keypair = Ed25519Keypair.fromSecretKey(fromHEX(process.env.PRIVATE_KEY));
        const rpcUrl = getFullnodeUrl('devnet');
        // create a client connected to devnet
        const client = new SuiClient({ url: rpcUrl });
        // Create and configure the transaction
        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [amount]);
        // transfer the split coin to a specific address
        tx.transferObjects([coin], recipient);
        // Sign and execute the transaction
        const result = yield client.signAndExecuteTransaction({
            transaction: tx,
            signer: keypair,
        });
        const transaction = yield client.waitForTransaction({
            digest: result.digest,
            options: {
                showEffects: true,
            },
        });
        return transaction;
    });
}
