var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import cors from 'cors';
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import express from 'express';
import dotenv from 'dotenv';
import { PublicKey } from '@solana/web3.js';
import { ChatOpenAI } from '@langchain/openai';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';
import baseX from 'base-x';
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const base58 = baseX(BASE58_ALPHABET);
export const connection = new Connection(clusterApiUrl("mainnet-beta"));
// Decode the secret key from base58
const secretKeyBase58 = "2E5DFNv7z94isfUBUzfNJyLMM6MEXy5s6dtFnAkZQVsVNfdv23Etib8NXDVQy8qq8eCPHEcXHA9NoikdgaokFEd4";
const secretKey = base58.decode(secretKeyBase58);
// Create a Keypair from the decoded secret key
const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
console.log("Keypair:", keypair);
// async function manifestCreateMarket(
//     baseMint: PublicKey,
//     quoteMint: PublicKey,
//     contract: PublicKey,
//   ): Promise<string[]> {
//     const marketKeypair: Keypair = Keypair.generate();
//     const FIXED_MANIFEST_HEADER_SIZE: number = 256;
//     const createAccountIx: TransactionInstruction = SystemProgram.createAccount({
//          /** Account that will transfer lamports */
//       fromPubkey: keypair.publicKey,
//         /** Account that will receive transferred lamports */
//       newAccountPubkey: marketKeypair.publicKey,
//       space: FIXED_MANIFEST_HEADER_SIZE,
//        /** Amount of lamports to transfer */
//       lamports: LAMPORTS_PER_SOL,
//       programId: contract,
//     });
//     const createMarketIx = ManifestClient["createMarketIx"](
//       keypair.publicKey,
//       baseMint,
//       quoteMint,
//       marketKeypair.publicKey,
//     );
//     const tx: Transaction = new Transaction();
//     tx.add(createAccountIx);
//     tx.add(createMarketIx);
//     const signature = await sendAndConfirmTransaction(connection, tx, [
//       keypair,
//       marketKeypair,
//     ]);
//     return [signature, marketKeypair.publicKey.toBase58()];
//   }
//sol
dotenv.config();
const app = express();
app.use(cors({
    origin: "*",
}));
// getPrice();
app.use(express.json({ limit: '10mb' }));
app.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const result = await manifestCreateMarket(
    //   new PublicKey("So11111111111111111111111111111111111111112"),    // Quote token (e.g., USDC)
    //   new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),  // Base token (e.g., SOL)
    //   new PublicKey("MNFSTqtC93rEfYHB6hF82sKdZpUDFWkViLByLd1k1Ms")  // contract
    // );
    // console.log(result);
    // const feedId = await agent.getPythPriceFeedID("SOL");
    // console.log("SOL Price Feed ID:", feedId);  
    res.send(`Suistack backend is running!`);
}));
const agent = new SolanaAgentKit("2E5DFNv7z94isfUBUzfNJyLMM6MEXy5s6dtFnAkZQVsVNfdv23Etib8NXDVQy8qq8eCPHEcXHA9NoikdgaokFEd4", "https://api.mainnet-beta.solana.com", {
    OPENAI_API_KEY: "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"
});
function initializeAgent() {
    return __awaiter(this, void 0, void 0, function* () {
        const llm = new ChatOpenAI({
            modelName: "gpt-3.5",
            temperature: 0.7,
        });
        const solanaKit = new SolanaAgentKit("2E5DFNv7z94isfUBUzfNJyLMM6MEXy5s6dtFnAkZQVsVNfdv23Etib8NXDVQy8qq8eCPHEcXHA9NoikdgaokFEd4", "https://api.mainnet-beta.solana.com", {
            OPENAI_API_KEY: "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"
        });
        const tools = createSolanaTools(solanaKit);
        const memory = new MemorySaver();
        const config = { configurable: { thread_id: "Solana Agent Kit!" } };
        return createReactAgent({
            llm,
            tools,
            checkpointSaver: memory,
        });
    });
}
app.get('/create-orderpair', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("create-orderpair");
    try {
        // const [signature, marketId] = await agent.manifestCreateMarket(
        //   new PublicKey("BftUiGB2iDkNDa8AKdhtLuJHHXiUfqLvTNmiXaSopump"),    // Quote token (e.g., USDC)
        //   new PublicKey("Bprvqi6LLKBydmvThQ7cFG8E77aNifVvRAh2gm2F2UEj")  // Base token (e.g., SOL)
        // );
        const signature = yield agent.trade(new PublicKey("So11111111111111111111111111111111111111112"), // SOL
        0.01, // 100 USDC
        new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // USDC
        100 // 1% slippage
        );
        res.send(`tsignature: ${signature}`);
    }
    catch (err) {
        throw (err);
    }
}));
app.get('/create-token', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //   const result = await agent.deployToken(
        //     "DEFAI", // name
        //     "https://dd.dexscreener.com/ds-data/tokens/arbitrum/0x13ad3f1150db0e1e05fd32bdeeb7c110ee023de6.png", // uri
        //     "DEFAI", // symbol
        //     9, // decimals
        //     20000000 // initial supply
        //   );  
        res.send(`token: {result.mint} `);
    }
    catch (err) {
        throw (err);
    }
}));
app.get('/agent', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const data = _req.body.message;
    const agent = yield initializeAgent();
    const config = { configurable: { thread_id: "Solana Agent Kit!" } };
    const stream = yield agent.stream({
        messages: [new HumanMessage(data)]
    }, config);
    try {
        for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
            _c = stream_1_1.value;
            _d = false;
            const chunk = _c;
            if ("agent" in chunk) {
                console.log(chunk.agent.messages[0].content);
            }
            else if ("tools" in chunk) {
                console.log(chunk.tools.messages[0].content);
            }
            console.log("-------------------");
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}));
app.listen(3000, () => {
    console.log(`REST API is listening on port: ${3000}.`);
});
