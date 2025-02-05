import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { PublicKey } from "@solana/web3.js";
import { init } from "./util/init.js";
import {
  getAllTokensBalance,
  getBalance,
  getCurrentOutputAmount,
  getPrice,
  getSolBalance,
  jupiterCancelOrders,
  jupiterGetOrders,
  jupiterLimitOrder,
  jupiterTrade,
  limitRateCheck,
} from "./util/jupiter.js";
import type { ILimitOrder, ILimitRateCheck, ISwapReqest } from "./type.js";
import { connection } from "./util/init.js";
import {
  TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
//init keypair

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json({ limit: "10mb" }));
app.get("/", async (_req, res) => {
  res.send(`Expressjs is running!`);
});

// app.post("/balance", async (_req, res) => {
//   const { wallet } = init(

//   );
//   const balance = await getBalance(
//     wallet.publicKey,
//     new PublicKey(_req.body.outputMint)
//   );
//   res.send(`balance ${balance}`);
// });

app.post("/jupiterLimitOrder", async (_req, res) => {
  try {
    // convert body to ILimitOrder
    const body: ILimitOrder = _req.body;
    const { wallet } = init(body.privateKey);

    try {
      const inputToken = new PublicKey(body.inputMint);
      try {
        const outputToken = new PublicKey(body.outputMint);
        const data = await jupiterLimitOrder(
          body.makingAmount, // amount of token to sell
          body.takingAmount, // amount of token to buy
          inputToken, // input token address
          outputToken, // output token address
          wallet
        );
        res.send(data);
      } catch (err) {
        return res.send("Invalid output token address");
      }
    } catch (err) {
      return res.send("Invalid input token address");
    }
  } catch (err) {
    console.log(err);
    res.send("Invalid request body");
  }
});

app.post("/jupiterSwap", async (_req, res) => {
  try {
    // convert body to ISwapReqest
    const body: ISwapReqest = _req.body;
    // init wallet and keypair
    const { wallet, keypair } = init(body.privateKey);
    console.log("jupiter swapp");
    try {
      const inputToken = new PublicKey(body.inputMint);

      try {
        const result = await jupiterTrade(
          inputToken, // input token address
          body.inputAmount, // amount of input token
          new PublicKey(body.outputMint), // output token address
          100, // 1% slippage
          1000000000, // 20000000 lamports priority fee
          wallet, // user waller
          keypair
        );

        res.send(result);
      } catch (err) {
        throw err;
      }
    } catch (e) {
      return res.send("Invalid intput token address");
    }
  } catch (err) {
    res.send("Invalid request body");
  }
});

app.post("/cancelOrders", async (_req, res) => {
  const { wallet } = init(_req.body.privateKey);
  const result = await jupiterCancelOrders(wallet);
  res.send(result);
});

app.post("/getOrders", async (_req, res) => {
  const result = await jupiterGetOrders(_req.body.address);
  res.send(result);
});

app.post("/balance", async (_req, res) => {
  if (_req.body.tokenAddress == "So11111111111111111111111111111111111111112") {
    const result = await getSolBalance(new PublicKey(_req.body.address));
    res.send({ balance: (result.balance ? result.balance : 0) / 1000000000 });
  } else {
    const result = await getBalance(
      new PublicKey(_req.body.address),
      new PublicKey(_req.body.tokenAddress),
      false
    );

    res.send({ balance: result });
  }
});

app.get("/rateLimitCheck", async (_req, res) => {
  const params: ILimitRateCheck = {
    inputMint: _req.query.inputMint as string,
    outputMint: _req.query.outputMint as string,
    inputAmount: parseFloat(_req.query.inputAmount as string),
    outputAmount: parseFloat(_req.query.outputAmount as string),
  };
  const data = await limitRateCheck(
    params.inputMint,
    params.outputMint,
    params.inputAmount,
    params.outputAmount
  );
  res.send(data);
});

app.get("/allTokens", async (_req, res) => {
  try {
    const publickey = new PublicKey(_req.query.address as string);
    const result = await getAllTokensBalance(publickey);
    res.send(result);
  } catch (e) {
    res.send({ code: 403, data: "Invalid address", status: false });
  }
});

app.listen(3000, () => {
  console.log(`REST API is listening on port: ${3000}.`);
});
