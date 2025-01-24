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

type GetLimitOrders = {
  maker: string;
  computeUnitPrice: "auto";
};

type CancelOrders = {
  maker: string;

  // "auto" sets the priority fee based on network congestion
  // and it will be capped at 500,000
  computeUnitPrice: string | "auto";

  // Specific order account public keys to cancel/close
  orders?: string[] | undefined;
};

type CancelOrdersResponse = {
  txs: string[];
};

interface Response {
  code: number;
  status: boolean;
  data: string;
}

interface GetOrdersResponse {
  code: number;
  status: boolean;
  data: string | string[];
}

export async function getBalance(
  publicKey: PublicKey,
  tikenAddress: PublicKey
): Promise<number> {
  try {
    // Get all token accounts owned by the wallet for the specific mint address
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      mint: tikenAddress,
    });

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    // Loop through the accounts and fetch their balances
    for (const account of tokenAccounts.value) {
      const tokenAccountAddress = account.pubkey;
      const balance = await connection.getTokenAccountBalance(
        tokenAccountAddress
      );

      return parseInt(balance.value.amount) || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching token accounts:", error);
    return 0;
  }
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
  const inputMintOwn =
    inputMint.toBase58() == "So11111111111111111111111111111111111111112"
      ? await getSolBalance(wallet.publicKey)
      : await getBalance(wallet.publicKey, inputMint);
  if (inputMintOwn && inputMintOwn < inputAmount) {
    return {
      code: 403,
      status: false,
      data: `Token ${inputMint.toBase58()} do not enough balance`,
    };
  }
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
          `&amount=${inputAmount}` +
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
    try {
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid,
      });
    } catch (e) {
      return { code: 500, status: false, data: "Transaction submit timeout" };
    }
    // const signature = await connection.sendTransaction(transaction);
    return { code: 200, status: true, data: txid };
  } catch (error: any) {
    return { code: 401, status: false, data: error.message };
  }
}

export async function getSolBalance(publicKey: PublicKey) {
  try {
    // Get the balance (in lamports)
    const balance = await connection.getBalance(publicKey);

    return balance;
  } catch (error) {
    return 0;
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
  const inputMintOwn =
    inputMint.toBase58() == "So11111111111111111111111111111111111111112"
      ? await getSolBalance(wallet.publicKey)
      : await getBalance(wallet.publicKey, inputMint);
  // const outputMintOwn =
  // outputMint.toBase58() == ""
  //   ? await getSolBalance(wallet.publicKey)
  //   : await getBalance(wallet.publicKey, outputMint);

  // console.log("outputMintOwn", outputMintOwn);

  if (inputMintOwn && inputMintOwn < makingAmount) {
    return {
      code: 403,
      data: `Token ${inputMint.toBase58()} do not enough balance`,
      status: false,
    };
  } else {
    // const inputDecimals = (await getMint(connection, inputMint)).decimals;
    // const outputDecimals = (await getMint(connection, outputMint)).decimals;

    // Calculate the correct amount based on actual decimals
    // const inputScaleAmount = makingAmount * Math.pow(10, inputDecimals);
    // const outputScaleAmount = takingAmount * Math.pow(10, outputDecimals);
    const createOrderBody: CreateOrder = {
      inputMint: inputMint.toString(),
      outputMint: outputMint.toString(),
      maker: wallet.publicKey.toBase58(),
      payer: wallet.publicKey.toBase58(),
      params: {
        makingAmount: `${makingAmount}`,
        takingAmount: `${takingAmount}`,
      },

      // "auto" sets the priority fee based on network congestion
      // and it will be capped at 500,000
      computeUnitPrice: "auto",
    };

    //Send request to API server

    const fetchOpts = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createOrderBody),
    };

    try {
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
        return { code: 200, data: hash, status: true };
      } catch (e: any) {
        return { code: 401, data: e.message, status: false };
      }
    } catch (error: any) {
      return { code: 401, status: false, data: "Fail to init transaction" };
    }
  }
}

export async function jupiterCancelOrders(wallet: Wallet) {
  const cancelOrdersBody: CancelOrders = {
    maker: wallet.publicKey.toBase58(),
    computeUnitPrice: "auto",
  };

  const fetchOpts = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cancelOrdersBody),
  };

  try {
    const response = await fetch(
      "https://api.jup.ag/limit/v2/cancelOrders",
      fetchOpts
    );

    if (response.status == 400) {
      return { code: 400, data: "No matching orders found", status: false };
    }

    //   Sign and submit the transaction on chain

    // Deserialise base64 tx response
    const { txs } = await response.json();

    const txBuff = Buffer.from(txs[0], "base64");
    const vtx = VersionedTransaction.deserialize(txBuff);
    // Sign with wallet
    try {
      vtx.sign([wallet.payer]);
      const rpcSendOpts: SendOptions = { skipPreflight: true };
      const hash = await connection.sendRawTransaction(
        vtx.serialize(),
        rpcSendOpts
      );
      return { code: 200, data: hash, status: true };
    } catch (e: any) {
      return { code: 401, data: e.message, status: false };
    }
  } catch (error: any) {
    return {
      code: 401,
      status: false,
      data: `Fail to init transaction ${error}`,
    };
  }
}

export async function jupiterGetOrders(
  address: string
): Promise<GetOrdersResponse> {
  const getOrdersBody: GetLimitOrders = {
    maker: address,
    computeUnitPrice: "auto",
  };
  const fetchOpts = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getOrdersBody),
  };
  const res = await fetch("https://api.jup.ag/limit/v2/cancelOrders", fetchOpts)
    .then((res) => res.json())
    .then((res) => {
      if (res.status == 400) {
        return { code: 200, status: true, data: [] };
      }
      return { code: 200, status: true, data: res.txs };
    })
    .catch((err) => {
      return { code: 401, status: false, data: err };
    });
  return { code: res.code, status: res.status, data: `${res.data}` };
}
