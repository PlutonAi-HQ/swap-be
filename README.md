# 🚀Swap API


This project using [Jupiter Station](https://station.jup.ag/docs/) to implement Solana network token swapping 

> API:
1. GET /rateLimitCheck
2. GET /api/v1/allTokens
3. GET /api/v1/searchToken
4. GET /api/v1/searchTokenPair
5. GET /api/v1/getPoolInfo
6. POST /api/v1/jupiterSwap
7. POST /api/v1/jupiterLimitOrder
8. POST /api/v1/cancelOrders
9. POST /api/v1/balance



## 1. GET /rateLimitCheck
- Description: Check if user input and output in ***limitOrder*** is not out of limit rate
- Params:
  - inputMint (string): input token address
  - outputMint (string): output token address
  - inputAmount (number): input token amount
  - outputAmount (number): output token amount
- Response:
  
  ![image](https://github.com/user-attachments/assets/f9244ffc-ea5a-47d4-9a70-1f18bfe14d59)

  Or
  
  ![image](https://github.com/user-attachments/assets/9dfe4eca-f974-4b8e-a035-cdcaa1d9125f)



## 2. GET /api/v1/allTokens
- Description: Get all balance of tokens by giving wallet address.
- Request Params:
  - address (string): user wallet address,
- Ex: get balance in Dw3dsx3MpoqMnNY4jL5gz33XSod2DT6qUKd3iHn5AaeJ wallet
  ```
    http://localhost:3000/allTokens?address=Dw3dsx3MpoqMnNY4jL5gz33XSod2DT6qUKd3iHn5AaeJ
  ```
- Sample response:
  ```json
  {
    "code": 200,
    "status": true,
    "data": [
        {
            "symbol": "DEFAI",
            "address": "DaXtdmYZLDbmwDEs7DghWwvdPdxMe3mqRKJMbNUGPEDk",
            "balance": 20000000
        },
        {
            "symbol": "USDC",
            "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            "balance": 7.529918
        },
        {
            "symbol": "SOL",
            "address": "So11111111111111111111111111111111111111112",
            "balance": 0.037282374
        }
    ]
  }

  ```
- Error:
  - Invalid address:
    ```json
    {
    "code": 403,
    "data": "Invalid address",
    "status": false
    }
    ```

## 3. GET /api/v1/searchToken
- Description: Get token detail by giving token name.
- Request Params:
  - name (string): token symbol,
- Ex: get pools info to swap 1 trump to sol
  ```
    http://localhost:3000/api/v1/searchTokenPair?tokenNameA=TRUMP&tokenNameB=sol&amount=1&slippage=5
  ```
- Sample response:
  ```json
  
  {
  "code": 200,
  "status": true,
  "data": {
    "id": "4e2747bf-577c-4eca-8ef7-853f3b4e361c",
    "success": true,
    "version": "V1",
    "data": {
      "swapType": "BaseIn",
      "inputMint": "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
      "inputAmount": "1000000",
      "outputMint": "So11111111111111111111111111111111111111112",
      "outputAmount": "107020420",
      "otherAmountThreshold": "106485317",
      "slippageBps": 50,
      "priceImpactPct": 0,
      "referrerAmount": "0",
      "routePlan": [
        {
          "poolId": "HKuJrP5tYQLbEUdjKwjgnHs2957QKjR2iWhJKTtMa1xs",
          "inputMint": "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
          "outputMint": "So11111111111111111111111111111111111111112",
          "feeMint": "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
          "feeRate": 25,
          "feeAmount": "2500",
          "remainingAccounts": [
            
          ]
        }
      ]
    }
  }
  }
  ```

## 4. GET /api/v1/searchTokenPair
- Description: Get the compute result of swap token. The result will contain: amoutn to be swap, pool ids by giving 2 token name.
- Request Params:
  - tokenNameA (string): token A symbol,
  - tokenNameB (string): token B symbol,
  - amount (number): input amount to swap
  - slippage (number): slippage (%)
  
- Ex: get token info of TRUMP 
  ```
    http://localhost:3000/api/v1/searchToken?name=TRUMP
  ```
- Sample response:
  ```json
  {
  "code": 200,
  "status": true,
  "data": {
    "id": "e6b88f9b-7831-462b-9833-f821c266d15f",
    "success": true,
    "version": "V1",
    "data": {
      "swapType": "BaseIn",
      "inputMint": "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
      "inputAmount": "1000000",
      "outputMint": "So11111111111111111111111111111111111111112",
      "outputAmount": "89213478",
      "otherAmountThreshold": "88767410",
      "slippageBps": 50,
      "priceImpactPct": 0.17,
      "referrerAmount": "0",
      "routePlan": [
        {
          "poolId": "7XzVsjqTebULfkUofTDH5gDdZDmxacPmPuTfHa1n9kuh",
          "inputMint": "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
          "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          "feeMint": "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
          "feeRate": 25,
          "feeAmount": "2500",
          "remainingAccounts": [
            "5cR2hc2DtagoxdE3JNSGuWvKasgQMeMusR1DpAMCNncT",
            "4k5iDaMAG8WQ9LVSy5odQrbheioK4E4VRD9N6vvdy9rj",
            "3AYvNUL8b3sdTFsij4NchTszo8KzUGCLiMfWfZSDGYuj"
          ],
          "lastPoolPriceX64": "77347680398783933840"
        },
        {
          "poolId": "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj",
          "inputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          "outputMint": "So11111111111111111111111111111111111111112",
          "feeMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          "feeRate": 1,
          "feeAmount": "1756",
          "remainingAccounts": [
            "FJP5BiS8KKWZDuaWX9bQkzjnuYqEiNdhgcbR6vs19rxG",
            "R8QQiVW31JSP19uCu35jMB4oabxeugXnpXCHKhitnt6",
            "7wjf5SENgnH8VJWDLK2zzN7aDRYsCnvJ6i3eYJpRYd8V"
          ],
          "lastPoolPriceX64": "8182035007705040043"
        }
      ]
    }
  }
  }

  ```

## 5. GET /api/v1/getPoolInfo
- Description: Get the pool info by giving 2 token name.
- Request Params:
  - tokenAName (string): token symbol,
  - tokenBName (string): token symbol,
- Ex: get token info of TRUMP 
  ```
    http://localhost:3000/api/v1/getPoolInfo?tokenAName=TRUMP&tokenBName=sol
  ```
- Sample response:
  ```json
  {
  "schemaVersion": "1.0.0",
  "pairs": [
    {
      "chainId": "solana",
      "dexId": "raydium",
      "url": "https://dexscreener.com/solana/hkujrp5tyqlbeudjkwjgnhs2957qkjr2iwhjkttma1xs",
      "pairAddress": "HKuJrP5tYQLbEUdjKwjgnHs2957QKjR2iWhJKTtMa1xs",
      "labels": [
        "CPMM"
      ],
      "baseToken": {
        "address": "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
        "name": "OFFICIAL TRUMP",
        "symbol": "TRUMP"
      },
      "quoteToken": {
        "address": "So11111111111111111111111111111111111111112",
        "name": "Wrapped SOL",
        "symbol": "SOL"
      },
      "priceNative": "0.08987",
      "priceUsd": "17.62",
      "txns": {
        "m5": {
          "buys": 31,
          "sells": 11
        },
        "h1": {
          "buys": 275,
          "sells": 114
        },
        "h6": {
          "buys": 526,
          "sells": 218
        },
        "h24": {
          "buys": 1790,
          "sells": 1567
        }
      },
      "volume": {
        "h24": 1526296.52,
        "h6": 307089.58,
        "h1": 191939.78,
        "m5": 23910.52
      },
      "priceChange": {
        "m5": 0.76,
        "h1": 5.38,
        "h6": 9.73,
        "h24": 1.44
      },
      "liquidity": {
        "usd": 7430144.86,
        "base": 210800,
        "quote": 18944
      },
      "fdv": 17623655879,
      "marketCap": 3524731870,
      "pairCreatedAt": 1737166730000,
      "info": {
        "imageUrl": "https://dd.dexscreener.com/ds-data/tokens/solana/6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN.png?key=f02e9e",
        "header": "https://dd.dexscreener.com/ds-data/tokens/solana/6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN/header.png?key=f02e9e",
        "openGraph": "https://cdn.dexscreener.com/token-images/og/solana/6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN?timestamp=1739516700000",
        "websites": [
          {
            "label": "Website",
            "url": "https://x.com/realDonaldTrump/status/1880446012168249386"
          }
        ],
        "socials": [
          {
            "type": "twitter",
            "url": "https://x.com/GetTrumpMemes"
          }
        ]
      }
    }
  ],
  "pair": {
    "chainId": "solana",
    "dexId": "raydium",
    "url": "https://dexscreener.com/solana/hkujrp5tyqlbeudjkwjgnhs2957qkjr2iwhjkttma1xs",
    "pairAddress": "HKuJrP5tYQLbEUdjKwjgnHs2957QKjR2iWhJKTtMa1xs",
    "labels": [
      "CPMM"
    ],
    "baseToken": {
      "address": "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
      "name": "OFFICIAL TRUMP",
      "symbol": "TRUMP"
    },
    "quoteToken": {
      "address": "So11111111111111111111111111111111111111112",
      "name": "Wrapped SOL",
      "symbol": "SOL"
    },
    "priceNative": "0.08987",
    "priceUsd": "17.62",
    "txns": {
      "m5": {
        "buys": 31,
        "sells": 11
      },
      "h1": {
        "buys": 275,
        "sells": 114
      },
      "h6": {
        "buys": 526,
        "sells": 218
      },
      "h24": {
        "buys": 1790,
        "sells": 1567
      }
    },
    "volume": {
      "h24": 1526296.52,
      "h6": 307089.58,
      "h1": 191939.78,
      "m5": 23910.52
    },
    "priceChange": {
      "m5": 0.76,
      "h1": 5.38,
      "h6": 9.73,
      "h24": 1.44
    },
    "liquidity": {
      "usd": 7430144.86,
      "base": 210800,
      "quote": 18944
    },
    "fdv": 17623655879,
    "marketCap": 3524731870,
    "pairCreatedAt": 1737166730000,
    "info": {
      "imageUrl": "https://dd.dexscreener.com/ds-data/tokens/solana/6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN.png?key=f02e9e",
      "header": "https://dd.dexscreener.com/ds-data/tokens/solana/6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN/header.png?key=f02e9e",
      "openGraph": "https://cdn.dexscreener.com/token-images/og/solana/6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN?timestamp=1739516700000",
      "websites": [
        {
          "label": "Website",
          "url": "https://x.com/realDonaldTrump/status/1880446012168249386"
        }
      ],
      "socials": [
        {
          "type": "twitter",
          "url": "https://x.com/GetTrumpMemes"
        }
      ]
    }
  }
  }

  ```


## 6. POST /api/v1/jupiterSwap
- Description: Perform a token swap.
- Body Parameters:
  - privateKey(string): User's private key.
  - inputMint(string): The address of the input token.
  - outputMint(string): The address of the output token.
  - inputAmount(number): The address of the output token.
- Ex: swap 1USDC -> SOL
    
  ![image](https://github.com/user-attachments/assets/517ca291-adf1-40c4-a108-21e06913b98d)


- Response: Returns the swap result.
  - Response structure: {code: number, status: boolean, data: string}
  - Successfull: {code: 200, status: true, data: ```transaction_id``` } 
  - Fail: {code: , status: false, data: ```error_message``` } - when the input is wrong or can not submit tx to blockchain (Congestion)
  - ⚠️ Code 500: Submit transaction timeout, neet to retry.
  - Code 403: Do not have enough balance.

  ![image](https://github.com/user-attachments/assets/41a5787a-68bb-41aa-983f-b575e3ef13fc)


## 7. POST /api/v1/jupiterLimitOrder  value transfer must > $5 ⚠️ Chỗ này lượng sol đổi ra giá usdc phải > $5, usdc input > 5USDC
- Description: Set up a limit order for token swaps.
- Body Parameters:
  - privateKey(string): User's private key.
  - inputMint(string): The address of the input token.
  - outputMint(string): The address of the output token.
  - makingAmount(number): The amount of input token.
  - takingAmount(number): The amount of the output token.
- Ex: create limit order for swap 0.025SOL -> 5.25USDC
  
  ![image](https://github.com/user-attachments/assets/decf068b-adf6-40eb-b012-773b3646e6cd)


- Response: Returns the limit order details.
  - Successfull: {code: 200, status: true, data: ```transaction_id``` } 
  - Fail: {code: , status: false, data: ```error_message``` }
  - Code 403: Do not have enough balance.


## 8. POST /api/v1/cancelOrders: 
- Description: cancel all the orders
- Body Parameters:
  - privateKey(string): User's private key.
- Response:
  - Successfull: {code: 200, status: true, data: ```transaction_id``` }
  - Fail: {code: , status: false, data: "No matching orders found" }
 
## 9. POST /api/v1/balance
- Description: Get the balance of the given address.
- Request Body:
  - address: string - Wallet address
  - tokenAddress: string - Token address
- Response:
  - Success: "balance": {
        "code": 200,
        "message": "Get balance successfull!",
        "balance": 3983896
    }
  - Fail:
    - {
        "code": 403,
        "message": "The token address or wallet address is invalid",
        "balance": null}
    - {
      code: 402 && 401,
      message: "This account do not own the token",
      balance: null}

  ![image](https://github.com/user-attachments/assets/eb558133-8f9e-4a22-ace3-6f8e8f39c7d3)



## 📂 Project Structure
- ```src/ultils/init.ts``` : Init the wallet and keypair by giving private key
- ```src/jupiter.ts``` : Jupiter Swap implementation
- ```src/type.ts``` : Types
- ```src/index.ts``` 
