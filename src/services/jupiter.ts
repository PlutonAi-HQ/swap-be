import { PublicKey, Transaction } from "@solana/web3.js";
import { VersionedTransaction, SendOptions } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import { connection, dca, init } from "../util/init.js";
import { Keypair } from "@solana/web3.js";
import fetch from "node-fetch";
import { Metaplex } from "@metaplex-foundation/js";
import { IToken, CreateOrder, CancelOrders, TokenDetails } from "../type.js";
import { dexscreener, jup } from "../util/api.js";
import { PoolData } from "../dto/raydium/index.js";
import {
  CloseDCAParams,
  DCA,
  Network,
  type CreateDCAParamsV2,
  type DepositParams,
  type WithdrawParams,
} from "@jup-ag/dca-sdk";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import {
  ICancleDCA,
  ICreateDCARequest,
  IWidrawDCARequest,
} from "../dto/jupiter.js";

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
        console.log(new_balance.balance, "-", outputBalance.balance);
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
    const res = await fetch(
      `https://api.jup.ag/limit/v2/openOrders?wallet=${address}`
    ).then((res) => res.json());
    const orders = res.map((order: any) => order.account);
    return { code: 200, status: true, data: orders };
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
  async fetchTokenList() {
    const data = await fetch(`${jup}/tokens?tags=lst,community`).then((res) =>
      res.json()
    );
    return data;
  }

  async searchCoin(coinName: string) {
    const data = await this.fetchTokenList();
    // @ts-ignore
    const filterTokenList = data.filter((token) => token.symbol == coinName);
    return { code: 200, status: true, data: filterTokenList };
  }

  async searchTokenPair(
    tokenNameA: string,
    tokenNameB: string,
    amount: number,
    slipage: number
  ) {
    try {
      const data = await this.fetchTokenList();
      if (data) {
        const tokenA = data.find(
          (token: TokenDetails) => token.symbol == tokenNameA.toUpperCase()
        );
        // @ts-ignore
        const tokenB = data.find(
          (token: TokenDetails) => token.symbol == tokenNameB.toUpperCase()
        );
        if (tokenA && tokenB) {
          const price = await fetch(`
            https://transaction-v1.raydium.io/compute/swap-base-in?inputMint=${
              tokenA.address
            }&outputMint=${tokenB.address}&amount=${
            amount * 10 ** tokenA.decimals
          }&slippageBps=${slipage * 10}&txVersion=V0`).then((res) =>
            res.json()
          );

          return {
            code: 200,
            status: true,
            data: {
              ...price,
              data: {
                ...price.data,
                outputAmount:
                  parseFloat(price.data.outputAmount) / 10 ** tokenB.decimals,
                inputAmount:
                  parseFloat(price.data.inputAmount) / 10 ** tokenA.decimals,
              },
            },
          };
        }
        return { code: 401, status: false, data: "Token not found" };
      }
      return { code: 401, status: false, data: "Token not found" };
    } catch (e) {
      return { code: 401, status: false, data: "Fail to fetch token" };
    }
  }

  async getPoolInfo(tokenAName: string, tokenBName: string) {
    try {
      const pool = await this.searchTokenPair(tokenAName, tokenBName, 1, 0.5);
      if (!pool.status) {
        return { code: 401, status: false, data: "Fail to fetch pool" };
      }
      const data = await fetch(
        `https://api-v3.raydium.io/pools/info/ids?ids=${pool.data.data.routePlan[0].poolId}`
      ).then((res) => res.json());
      const poolInfo = await this.getPoolInfoByID(
        pool.data.data.routePlan[0].poolId
      );
      const poolInfoData = poolInfo.data.pairs[0];
      let socialsInfo = {};
      if (poolInfoData.info)
        socialsInfo = {
          websites: poolInfoData.info.websites,
          socials: poolInfoData.info.socials,
        };

      return data.data.map((data: PoolData) => {
        return {
          poolId: data.id,
          price: data.price,
          mintAmountA: data.mintAmountA,
          mintAmountB: data.mintAmountB,
          mintA: data.mintA,
          mintB: data.mintB,
          tvl: data.tvl,
          day: data.day,
          week: data.week,
          month: data.month,
          // @ts-ignore
          info: socialsInfo,
        };
      });
      // da co pool id, fetch thong tin pool tu dexscreener
    } catch (e) {
      // @ts-ignore
      return { code: 401, status: false, data: e.message };
    }
  }

  async getPoolInfoByID(poolID: string) {
    try {
      const data = await fetch(
        `${dexscreener}/latest/dex/pairs/solana/${poolID}`
      ).then((res) => res.json());
      return { code: 200, data, status: true };
      // da co pool id, fetch thong tin pool tu dexscreener
    } catch (e) {
      // @ts-ignore
      return { code: 401, status: false, data: e.message };
    }
  }

  async createDCA(data: ICreateDCARequest, user: Wallet) {
    const {
      inputMint,
      outputMint,
      inputAmount,
      timeHoursCircle,
      amountPerCircle,
    } = data;
    const inputTokenResponse = await this.searchCoin(inputMint);
    const outputTokenResponse = await this.searchCoin(outputMint);
    if (!inputTokenResponse || !outputTokenResponse) {
      return { code: 401, status: false, data: "Token not found" };
    }

    // Get the token address and decimals
    const inputTokenAddress = inputTokenResponse.data[0].address;
    const outputTokenAddress = outputTokenResponse.data[0].address;
    const inputTokenDecimals = inputTokenResponse.data[0].decimals;
    const outputTokenDecimals = outputTokenResponse.data[0].decimals;
    // scale the amount to the correct decimals
    const scaledInputAmount = inputAmount * 10 ** inputTokenDecimals;
    const scaleOutAmountPerCircle = amountPerCircle * 10 ** inputTokenDecimals;

    const params: CreateDCAParamsV2 = {
      payer: user.publicKey, // could have a different account pay for the tx (make sure this account is also a signer when sending the tx)
      user: user.publicKey,
      inAmount: BigInt(scaledInputAmount), // buy a total of 5 USDC over 5 days
      inAmountPerCycle: BigInt(scaleOutAmountPerCircle), // buy using 1 USDC each day
      cycleSecondsApart: BigInt(parseInt(`${60 * 60 * timeHoursCircle}`)), // 1 day between each order -> 60 * 60 * hours
      inputMint: new PublicKey(inputTokenAddress), // sell
      outputMint: new PublicKey(outputTokenAddress), // buy
      minOutAmountPerCycle: null, // effectively allows for a max price. refer to Integration doc
      maxOutAmountPerCycle: null, // effectively allows for a min price. refer to Integration doc
      startAt: null, // unix timestamp in seconds
      userInTokenAccount: undefined, // optional: if the inputMint token is not in an Associated Token Account but some other token account, pass in the PublicKey of the token account, otherwise, leave it undefined
    };

    const { tx, dcaPubKey } = await dca.createDcaV2(params);
    const txid = await sendAndConfirmTransaction(connection, tx, [user.payer]);

    console.log("Create DCA: ", { txid });

    return { code: 200, status: true, data: { txid, dcaPubKey } };
  }

  // this is for withdrawing from program ATA
  async withdraw(data: IWidrawDCARequest) {
    const { privateKey, dcaPublickey, amount, inputMint } = data;
    const initialWallet = init(privateKey);
    if (!initialWallet)
      return { code: 401, status: false, data: "Invalid private key" };
    const user = initialWallet.wallet;
    const tokenInfo = await this.searchCoin(inputMint);
    if (!tokenInfo)
      return { code: 401, status: false, data: "Token not found" };
    const tokenAddress = tokenInfo.data[0].address;
    const tokenDecimals = tokenInfo.data[0].decimals;
    const scaledAmount = amount * 10 ** tokenDecimals;
    console.log(dcaPublickey, tokenAddress, scaledAmount);
    // it's possible to withdraw in-tokens only or out-tokens only or both in and out tokens together. See WithdrawParams for more details
    const params: WithdrawParams = {
      user: user.publicKey,
      dca: dcaPublickey,
      inputMint: new PublicKey(tokenAddress),
      withdrawInAmount: BigInt(scaledAmount),
    };

    const { tx } = await dca.withdraw(params);

    const txid = await sendAndConfirmTransaction(connection, tx, [user.payer]);

    console.log("Withdraw: ", { txid });
  }

  async closeDCA(data: ICancleDCA) {
    const { privateKey, dcaPublickey } = data;
    const initialWallet = init(privateKey);
    if (!initialWallet)
      return { code: 401, status: false, data: "Invalid private key" };
    const user = initialWallet.wallet;
    const params: CloseDCAParams = {
      user: user.publicKey,
      dca: dcaPublickey,
    };

    const { tx } = await dca.closeDCA(params);

    const txid = await sendAndConfirmTransaction(connection, tx, [user.payer]);

    return { code: 200, status: true, data: { txid } };
  }
}

const jupiterServices = new JupiterServices();

export { jupiterServices };
//note: some token is not get from the api, so we need to add it manually
