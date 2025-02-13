import { PublicKey, Transaction } from "@solana/web3.js";
import { VersionedTransaction, SendOptions } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import { connection } from "../util/init.js";
import { Keypair } from "@solana/web3.js";
import fetch from "node-fetch";
import { Metaplex } from "@metaplex-foundation/js";
import { IToken, CreateOrder, CancelOrders, GetLimitOrders } from "../type.js";
import { sendAndConfirmTransaction } from "@solana/web3.js";

interface Response {
  code: number;
  status: boolean;
  data: string;
}

interface IBalanceResponse {
  code: number;
  message: string;

  balance: number | null;
}

interface GetOrdersResponse {
  code: number;
  status: boolean;

  data: string | string[];
}

class JupiterServices {
  async getBalance(
    publicKey: PublicKey,
    tikenAddress: PublicKey,
    scale: boolean = true
  ): Promise<IBalanceResponse> {
    try {
      // Get all token accounts owned by the wallet for the specific mint address
      const tokenAccounts = await connection.getTokenAccountsByOwner(
        publicKey,
        {
          mint: tikenAddress,
        }
      );

      if (tokenAccounts.value.length === 0) {
        return {
          code: 401,
          message: "This account do not own the token",
          balance: null,
        };
      }

      // Loop through the accounts and fetch their balances
      for (const account of tokenAccounts.value) {
        const tokenAccountAddress = account.pubkey;
        const balance = await connection.getTokenAccountBalance(
          tokenAccountAddress
        );
        console.log(balance);
        return parseInt(balance.value.amount)
          ? {
              code: 200,
              message: "Get balance successfull!",
              balance: scale
                ? parseInt(balance.value.amount)
                : parseFloat(balance.value.uiAmountString || "0"),
            }
          : {
              code: 401,
              message: "This account do not own the token",
              balance: null,
            };
      }

      return {
        code: 402,
        message: "This account do not own the token",
        balance: null,
      };
    } catch (error) {
      console.error("Error fetching token accounts:", error);
      return {
        code: 403,
        message: "The token address or wallet address is invalid",
        balance: null,
      };
    }
  }

  async scaledAmount(address: string, amount: number) {
    const response = await (
      await fetch(`https://api.jup.ag/tokens/v1/token/${address}`)
    ).json();
    if (response) {
      //return the scaledamount if token found
      return amount * 10 ** response.decimals;
    }
    // return -1 if token not found
    return -1;
  }

  async getPrice(tokenAddress: string): Promise<number> {
    const price = await (
      await fetch(
        `https://api.dexscreener.com/token-pairs/v1/solana/${tokenAddress}`
      )
    ).json();
    return price[0] ? price[0].priceUsd : -1;
  }

  async trade(
    inputMint: PublicKey, // the input token to swap from
    inputAmount: number, // the amount of input token to swap
    outputMint: PublicKey, // the output token to swap to
    slippageBps: number, // slipage
    priorityFee: number, // priority fee
    wallet: Wallet, // user wallet
    keypair: Keypair // user public key
  ): Promise<Response> {
    const inputScaled = await this.scaledAmount(
      inputMint.toBase58(),
      inputAmount
    );

    if (inputScaled == -1) {
      return {
        code: 403,
        status: false,
        data: `Token ${inputMint.toBase58()} not found`,
      };
    }

    const inputMintOwn =
      inputMint.toBase58() == "So11111111111111111111111111111111111111112"
        ? await this.getSolBalance(wallet.publicKey)
        : await this.getBalance(wallet.publicKey, inputMint);
    const outputBalance =
      outputMint.toBase58() == "So11111111111111111111111111111111111111112"
        ? await this.getSolBalance(wallet.publicKey)
        : await this.getBalance(wallet.publicKey, outputMint);
    if (inputMintOwn.balance && inputMintOwn.balance < inputScaled) {
      return {
        code: 403,
        status: false,
        data: `Token ${inputMint.toBase58()} do not enough balance`,
      };
    }
    try {
      // Convert input amount to correct decimals
      // request for transaction quote
      const quoteResponse = await (
        await fetch(
          `https://quote-api.jup.ag/v6/quote?` +
            `inputMint=${inputMint.toString()}` +
            `&outputMint=${outputMint.toString()}` +
            `&amount=${inputScaled}` +
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
            dynamicSlippage: true,
            prioritizationFeeLamports: {
              priorityLevelWithMaxLamports: {
                maxLamports: 20000000,
                global: false,
                priorityLevel: "veryHigh",
              },
            },
            feeAccount: null,
          }),
        })
      ).json();

      // Deserialize transaction
      // const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
      // // Deserialize transaction
      // const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      // // Sign and send transaction
      // transaction.sign([wallet.payer]);
      // const latestBlockHash = await connection.getLatestBlockhash();
      // const rawTransaction = transaction.serialize();
      // const txid = await connection.sendRawTransaction(rawTransaction, {
      //   skipPreflight: true,
      //   maxRetries: 2,
      // });
      // --fix ===============
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
        let res;
        await Promise.all([
          connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: txid,
          }),
          (async () => {
            let new_balance;
            while (true) {
              new_balance =
                outputMint.toBase58() ==
                "So11111111111111111111111111111111111111112"
                  ? await this.getSolBalance(wallet.publicKey)
                  : await this.getBalance(wallet.publicKey, outputMint);

              if (
                outputBalance.balance &&
                new_balance.balance &&
                new_balance.balance > outputBalance.balance
              ) {
                return { code: 201, status: true, data: txid };
              }
              await new Promise((resolve) => setTimeout(resolve, 6000));
            }
          })(),
        ]);
        return { code: 200, status: true, data: txid };
      } catch (e) {
        const new_balance =
          outputMint.toBase58() == "So11111111111111111111111111111111111111112"
            ? await this.getSolBalance(wallet.publicKey)
            : await this.getBalance(wallet.publicKey, outputMint);
        if (
          outputBalance.balance &&
          new_balance.balance &&
          new_balance.balance > outputBalance.balance
        ) {
          return { code: 200, status: true, data: txid };
        }
        return { code: 500, status: false, data: "Transaction submit timeout" };
      }
      // const signature = await connection.sendTransaction(transaction);
      // return { code: 200, status: true, data: txid };
    } catch (error: any) {
      return { code: 401, status: false, data: error.message };
    }
  }

  async getSolBalance(publicKey: PublicKey): Promise<IBalanceResponse> {
    try {
      // Get the balance (in lamports)
      const balance = await connection.getBalance(publicKey);

      return {
        code: 200,
        message: "Get balance successfull!",
        balance: balance,
      };
    } catch (error) {
      return {
        code: 403,
        message: "The token address or wallet address is invalid",
        balance: null,
      };
    }
  }

  async getCurrentOutputAmount(
    inputToken: string,
    outputToken: string,
    inputAmoount: number
  ) {
    // input token A -> x usdc | x usdc -> y token B
    // get input token orice
    const inputAsUSDC = (await this.getPrice(inputToken)) * inputAmoount;
    // calculate the amount of token B can be bought with the usdc by token A
    const currentSwapAmount = inputAsUSDC / (await this.getPrice(outputToken));
    // check if the output token amount is less than the maximum expected
    return currentSwapAmount;
  }

  async limitRateCheck(
    inputMint: string, // input token mint address
    outputMint: string, // output token mint address
    inputAmount: number, // amount of input token
    outputAmount: number
  ) {
    const currentUsdRate = await this.getCurrentOutputAmount(
      inputMint,
      outputMint,
      inputAmount
    );

    if (currentUsdRate * 10 < outputAmount) {
      return {
        code: 403,
        status: false,
        data: `Token ${outputMint} is to large to swap, must less than 1000% of the current price, current rate: ${
          (outputAmount * 100) / currentUsdRate
        }%`,
      };
    }
    return {
      code: 200,
      status: true,
      data: `Current rate: ${(outputAmount * 100) / currentUsdRate}%`,
    };
  }
  // Get the serialized transactions to create the limit order
  async limitOrder(
    makingAmount: number, // amount of token to sell
    takingAmount: number, // amount of token to buy
    inputMint: PublicKey, // input token mint address
    outputMint: PublicKey, // output token mint address
    wallet: Wallet // user wallet
  ) {
    const inputMintOwn =
      inputMint.toBase58() == "So11111111111111111111111111111111111111112"
        ? await this.getSolBalance(wallet.publicKey)
        : await this.getBalance(wallet.publicKey, inputMint);

    const scaleInputAmount = await this.scaledAmount(
      inputMint.toBase58(),
      makingAmount
    );
    if (scaleInputAmount == -1) {
      return {
        code: 403,
        status: false,
        data: `Token ${inputMint.toBase58()} not found`,
      };
    }
    //check if the output expected is larger than 1000% current price
    const currentOutputAmount = await this.getCurrentOutputAmount(
      inputMint.toBase58(),
      outputMint.toBase58(),
      makingAmount
    );

    //check if expected output amount is > than 10x of the current price output
    if (currentOutputAmount * 10 <= takingAmount) {
      return {
        code: 403,
        status: false,
        data: `Token ${outputMint.toBase58()} is to large to swap, must less than 1000% of the current price, current rate: ${
          (takingAmount * 100) / currentOutputAmount
        }%`,
      };
    }

    const inputPrice =
      (await this.getPrice(inputMint.toBase58())) * makingAmount;
    if (inputPrice <= 5) {
      return {
        code: 403,
        status: false,
        data: `Token ${inputMint.toBase58()} not enough to swap, minimum amount is 5 USD, current input ~ ${inputPrice}USD`,
      };
    }
    const scaleOutputAmount = await this.scaledAmount(
      outputMint.toBase58(),
      takingAmount
    );
    if (scaleOutputAmount == -1) {
      return {
        code: 403,
        status: false,
        data: `Token ${outputMint.toBase58()} not found`,
      };
    }
    // const outputMintOwn =
    // outputMint.toBase58() == ""
    //   ? await getSolBalance(wallet.publicKey)
    //   : await getBalance(wallet.publicKey, outputMint);

    // console.log("outputMintOwn", outputMintOwn);

    if (inputMintOwn.balance == null || inputMintOwn.balance == 0) {
      return {
        code: 403,
        data: `Token ${inputMint.toBase58()} do not enough balance`,
        status: false,
      };
    }
    if (inputMintOwn.balance && inputMintOwn.balance < scaleInputAmount) {
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
          makingAmount: `${scaleInputAmount}`,
          takingAmount: `${scaleOutputAmount}`,
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

  async cancelOrders(wallet: Wallet) {
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

  async getOrders(address: string): Promise<GetOrdersResponse> {
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
    const res = await fetch(
      "https://api.jup.ag/limit/v2/cancelOrders",
      fetchOpts
    )
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

  async getAllTokensBalance(publicKey: PublicKey) {
    try {
      const solBalance = await this.getSolBalance(publicKey);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        }
      );
      const formatedData = await Promise.all(
        tokenAccounts.value.map(async (item) => {
          const mint = new PublicKey(item.account.data.parsed.info.mint);
          const symbol = await this.getTokenSymbol(mint);
          return {
            symbol: symbol || mint,
            address: mint.toBase58(),
            balance: parseFloat(
              item.account.data.parsed.info.tokenAmount.uiAmountString
            ),
          };
        })
      );
      formatedData.push({
        symbol: "SOL",
        address: "So11111111111111111111111111111111111111112",
        balance: solBalance.balance ? solBalance.balance / 10 ** 9 : 0,
      });
      return { code: 200, status: true, data: formatedData };
    } catch (e) {
      return { code: 401, status: true, data: "Error when fetching tokens" };
    }
  }

  async getTokenSymbol(mintPublicKey: PublicKey) {
    const metaplex = Metaplex.make(connection);
    try {
      // Fetch token metadata
      const metadata = await metaplex
        .nfts()
        .findByMint({ mintAddress: mintPublicKey });

      return metadata.symbol; // Token Symbol
    } catch (error) {
      console.error("Error fetching token symbol:", error);
      return null;
    }
  }

  async getTokensByName(name: string) {
    if (name == "SOL")
      return {
        code: 200,
        status: true,
        data: [
          {
            symbol: "SOL",
            address: "So11111111111111111111111111111111111111112",
            decimals: 9,
          },
        ],
      };
    try {
      const data = await fetch("https://api-v3.raydium.io/mint/list").then(
        (res) => res.json()
      );
      const minlist: any[] = data.data.mintList;
      if (minlist) {
        let tokens: IToken[] = [];
        minlist.forEach((item) => {
          if (item.symbol == name) {
            tokens.push({
              symbol: item.symbol,
              address: item.address,
              decimals: item.decimals,
            });
          }
        });
        if (tokens.length == 0) {
          return { code: 401, status: false, data: "Token not found" };
        }
        return { code: 200, status: true, data: tokens };
      }
      return { code: 401, status: false, data: "Token not found" };
    } catch (e) {
      return { code: 401, status: false, data: "Fail to fetch token" };
    }
  }
}

const jupiterServices = new JupiterServices();

export { jupiterServices };
//note: some token is not get from the api, so we need to add it manually
