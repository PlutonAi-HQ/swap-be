import { PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { VersionedTransaction, SendOptions } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import { connection } from "./init.js";
import { Keypair } from "@solana/web3.js";
import fetch from "node-fetch";

type CreateOrder = {
  inputMint: string;
  outputMint: string;
  maker: string;
  payer: string;
  params: {
    makingAmount: string;
    takingAmount: string;
    expiredAt?: string;
    feeBps?: string;
  };
  computeUnitPrice: string | "auto";
  referral?: string;
  inputTokenProgram?: string;
  outputTokenProgram?: string;
  wrapAndUnwrapSol?: boolean;
};

type CreateOrderResponse = {
  order: string;
  tx: string;
};

interface Response {
  status: boolean;
  data: string;
}

export async function jupiterTrade(
  inputMint: PublicKey, // the input token to swap from
  inputAmount: number, // the amount of input token to swap
  outputMint: PublicKey, // the output token to swap to
  slippageBps: number, // slipage
  priorityFee: number, // priority fee
  wallet: Wallet, // user wallet
  keypair: Keypair // user public key
): Promise<Response> {
  try {
    // Convert input amount to correct decimals
    const inputDecimals = (await getMint(connection, inputMint)).decimals;

    // Calculate the correct amount based on actual decimals
    const scaledAmount = inputAmount * Math.pow(10, inputDecimals);

    // request for transaction quote
    const quoteResponse = await (
      await fetch(
        `https://quote-api.jup.ag/v6/quote?` +
          `inputMint=${inputMint.toString()}` +
          `&outputMint=${outputMint.toString()}` +
          `&amount=${scaledAmount}` +
          `&slippageBps=${slippageBps}` +
          `&onlyDirectRoutes=true` +
          `&maxAccounts=20`
      )
    ).json();

    // Get serialized transaction

    // create a transaction
    const { swapTransaction } = await (
      await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: keypair.publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
          feeAccount: null,
          priorityLevelWithMaxLamports: {
            maxLamports: priorityFee, // max priority fee
            priorityLevel: "veryHigh", // If you want to land transaction fast, set this to use `veryHigh`. You will pay on average higher priority fee.
          },
        }),
      })
    ).json();
    // Deserialize transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    // Deserialize transaction
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    // Sign and send transaction
    transaction.sign([wallet.payer]);
    const latestBlockHash = await connection.getLatestBlockhash();
    const rawTransaction = transaction.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2,
    });

    // Wait for transaction to be confirmed (submit to blockchain)
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txid,
    });
    // const signature = await connection.sendTransaction(transaction);
    return { status: true, data: txid };
  } catch (error: any) {
    return { status: false, data: error.message };
  }
}

// Get the serialized transactions to create the limit order
export async function jupiterLimitOrder(
  makingAmount: number, // amount of token to sell
  takingAmount: number, // amount of token to buy
  inputMint: PublicKey, // input token mint address
  outputMint: PublicKey, // output token mint address
  wallet: Wallet // user wallet
) {
  const inputDecimals = (await getMint(connection, inputMint)).decimals;
  const outputDecimals = (await getMint(connection, outputMint)).decimals;

  // Calculate the correct amount based on actual decimals
  const inputScaleAmount = makingAmount * Math.pow(10, inputDecimals);
  const outputScaleAmount = takingAmount * Math.pow(10, outputDecimals);
  const createOrderBody: CreateOrder = {
    inputMint: inputMint.toString(),
    outputMint: outputMint.toString(),
    maker: wallet.publicKey.toBase58(),
    payer: wallet.publicKey.toBase58(),
    params: {
      makingAmount: `${inputScaleAmount}`,
      takingAmount: `${outputScaleAmount}`,
    },

    // "auto" sets the priority fee based on network congestion
    // and it will be capped at 500,000
    computeUnitPrice: "auto",
  };
  console.log("body", createOrderBody);

  //Send request to API server

  const fetchOpts = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createOrderBody),
  };

  const response = await fetch(
    "https://api.jup.ag/limit/v2/createOrder",
    fetchOpts
  );

  //   Sign and submit the transaction on chain

  // Deserialise base64 tx response
  const { order, tx } = await response.json();
  const txBuff = Buffer.from(tx, "base64");
  const vtx = VersionedTransaction.deserialize(txBuff);

  // Sign with wallet
  try {
    vtx.sign([wallet.payer]);
    const rpcSendOpts: SendOptions = { skipPreflight: true };
    const hash = await connection.sendRawTransaction(
      vtx.serialize(),
      rpcSendOpts
    );
    return { data: hash, status: true };
  } catch (e: any) {
    return { data: e.message, status: false };
  }
}
