import { RequestHandler, Router } from "express";
import { ILimitOrder, ILimitRateCheck, ISwapReqest } from "../type.js";
import { init } from "../util/init.js";
import { PublicKey } from "@solana/web3.js";
import { jupiterServices } from "../services/index.js";
import { ICreateDCARequest, IWidrawDCARequest } from "../dto/jupiter.js";

const limitOrder: RequestHandler = async (_req, res) => {
  try {
    // convert body to ILimitOrder
    const body: ILimitOrder = _req.body;
    const initialWallet = init(body.privateKey);
    if (!initialWallet) {
      res.send({ code: 403, data: "Invalid private key", status: false });
      return;
    }
    const { wallet } = initialWallet;

    try {
      const inputToken = new PublicKey(body.inputMint);
      try {
        const outputToken = new PublicKey(body.outputMint);
        const data = await jupiterServices.limitOrder(
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
};

const swap: RequestHandler = async (_req, res) => {
  try {
    // convert body to ISwapReqest
    const body: ISwapReqest = _req.body;
    // init wallet and keypair
    const initialWallet = init(body.privateKey);
    if (!initialWallet) {
      res.send({ code: 403, data: "Invalid private key", status: false });
      return;
    }
    const { wallet, keypair } = initialWallet;
    console.log("jupiter swapp");
    try {
      const inputToken = new PublicKey(body.inputMint);

      try {
        const result = await jupiterServices.trade(
          inputToken, // input token address
          body.inputAmount, // amount of input token
          new PublicKey(body.outputMint), // output token address
          body.slippage * 100, // 1% slippage
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
};

const cancelOrders: RequestHandler = async (_req, res) => {
  const initialWallet = init(_req.body.privateKey);
  if (!initialWallet) {
    res.send({ code: 403, data: "Invalid private key", status: false });
    return;
  }
  const { wallet } = initialWallet;
  const result = await jupiterServices.cancelOrders(wallet);
  res.send(result);
};

const getOrders: RequestHandler = async (_req, res) => {
  const result = await jupiterServices.getOrders(_req.query.address as string);
  res.send(result);
};

const balance: RequestHandler = async (_req, res) => {
  const tokenAddress = _req.query.tokenAddress as string;
  const address = _req.query.address as string;
  if (tokenAddress == "So11111111111111111111111111111111111111112") {
    const result = await jupiterServices.getSolBalance(new PublicKey(address));
    res.send({ balance: (result.balance ? result.balance : 0) / 1000000000 });
  } else {
    const result = await jupiterServices.getBalance(
      new PublicKey(address),
      new PublicKey(tokenAddress),
      false
    );

    res.send({ balance: result });
  }
};

const rateLimitCheck: RequestHandler = async (_req, res) => {
  const params: ILimitRateCheck = {
    inputMint: _req.query.inputMint as string,
    outputMint: _req.query.outputMint as string,
    inputAmount: parseFloat(_req.query.inputAmount as string),
    outputAmount: parseFloat(_req.query.outputAmount as string),
  };
  const data = await jupiterServices.limitRateCheck(
    params.inputMint,
    params.outputMint,
    params.inputAmount,
    params.outputAmount
  );
  res.send(data);
};

const allTokens: RequestHandler = async (_req, res) => {
  try {
    const publickey = new PublicKey(_req.query.address as string);
    const result = await jupiterServices.getAllTokensBalance(publickey);
    res.send(result);
  } catch (e) {
    res.send({ code: 403, data: "Invalid address", status: false });
  }
};

const tokenByName: RequestHandler = async (_req, res) => {
  try {
    const result = await jupiterServices.getTokensByName(
      _req.query.name as string
    );
    res.send(result);
  } catch (e) {
    res.send({ code: 403, data: "Invalid name", status: false });
  }
};

const searchToken: RequestHandler = async (_req, res) => {
  const result = await jupiterServices.searchCoin(_req.query.name as string);
  res.send(result);
};

const searchTokenPair: RequestHandler = async (_req, res) => {
  const result = await jupiterServices.searchTokenPair(
    _req.query.tokenNameA as string,
    _req.query.tokenNameB as string,
    parseFloat(_req.query.amount as string),
    parseFloat(_req.query.slippage as string)
  );
  res.send(result);
};

const getPoolInfo: RequestHandler = async (_req, res) => {
  const rsult = await jupiterServices.getPoolInfo(
    _req.query.tokenAName as string,
    _req.query.tokenBName as string
  );
  res.send(rsult);
};

const createDCA: RequestHandler = async (_req, res) => {
  try {
    const body: ICreateDCARequest = _req.body;
    const initialWallet = init(body.privateKey);
    if (!initialWallet) {
      res.send({ code: 403, data: "Invalid private key", status: false });
      return;
    }
    const user = initialWallet.wallet;

    const result = await jupiterServices.createDCA(body, user);
    res.send(result);
  } catch (e) {
    // @ts-ignore
    res.send({ code: 403, data: e.message, status: false });
  }
};
const withdrawDCA: RequestHandler = async (_req, res) => {
  try {
    const body: IWidrawDCARequest = _req.body;
    const result = await jupiterServices.withdraw(body);
    res.send(result);
  } catch (e) {
    // @ts-ignore
    res.send({ code: 403, data: e.message, status: false });
  }
};

const closeDCA: RequestHandler = async (_req, res) => {
  try {
    const body = _req.body;
    const result = await jupiterServices.closeDCA(body);
    res.send(result);
  } catch (e) {
    // @ts-ignore
    res.send({ code: 403, data: e.message, status: false });
  }
};

const jupiterControllers = {
  searchToken,
  searchTokenPair,
  getPoolInfo,
  limitOrder,
  swap,
  cancelOrders,
  getOrders,
  balance,
  rateLimitCheck,
  allTokens,
  tokenByName,
  createDCA,
  withdrawDCA,
  closeDCA,
};

export { jupiterControllers };
