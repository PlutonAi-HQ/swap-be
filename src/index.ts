import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { PublicKey } from '@solana/web3.js';
import { init } from './util/init.js';
import { jupiterLimitOrder, jupiterTrade } from './util/jupiter.js';
import type {ILimitOrder, ISwapReqest} from './type.js';

//init keypair

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json({ limit: '10mb' }));
app.get('/', async (_req, res) => {
  res.send(`Expressjs is running!`);
});


app.use('/jupiterLimitOrder', async(_req, res) => {
  try {
    // convert body to ILimitOrder
    const body: ILimitOrder  = _req.body; 
    const {wallet} = init(body.privateKey);

    const data = await jupiterLimitOrder(
      body.inputMint,
      body.outputMint,
      body.inputMint, //usdc
      body.outputMint, //usdc
      wallet
    )
    res.send(data);
  } catch (err) {
    res.send("Invalid request body");
  }
})

app.get('/jupiterSwap', async (_req, res) => {
  try {
    // convert body to ISwapReqest
    const body: ISwapReqest = _req.body;
    // init wallet and keypair
    const {wallet, keypair} = init(body.privateKey);
    console.log("jupiter swapp");
    
    try {
      const result = await jupiterTrade(
        new PublicKey(body.inputMint), // input token address
        body.inputAmount, // amount of input token
        new PublicKey(body.outputMint), // output token address
        100, // 1% slippage
        20000000, // 20000000 lamports priority fee
        wallet, // user waller
        keypair
      );

      res.send(result);  
    }catch(err) {
      throw(err);
    }
  } catch(err) {
    res.send("Invalid request body");
  }

});


app.listen(3000, () => {
  console.log(`REST API is listening on port: ${3000}.`);
});