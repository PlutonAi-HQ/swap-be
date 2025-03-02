# Pluton-AI-Defi-Integration 🧪
[![Follow me](https://img.shields.io/github/followers/PlutonAi-HQ?label=follow%20me&style=social)](https://github.com/PlutonAi-HQ)

This repository integrates DeFi functionalities on the Solana blockchain using the [Jupiter API and SDK](https://station.jup.ag/docs). It enables seamless interaction with decentralized finance services, including token swaps, limit orders, dollar-cost averaging (DCA), and wallet tracking. Users can efficiently execute swaps with optimal routing, set limit orders to buy or sell at specific price points, automate periodic token purchases through DCA, and monitor their wallet portfolios. Designed for efficiency and scalability, this project provides a smooth and user-friendly DeFi experience on Solana. 🚀

![image](https://github.com/user-attachments/assets/89524d9e-3bfe-4a9b-a572-b748aaef3ad3)


API Docs: [Notion](https://gabby-speedboat-1fa.notion.site/PlutonAI-Defi-Integration-API-Docs-1aacc149636980d9a1efe0155a54c075?pvs=4)

## Table of Contents
- [Overview](#overview)
- [Features](#features)

# 🌈 Overview:

This repository integrates DeFi functionalities on the Solana blockchain using the Jupiter API and SDK. It provides a seamless experience for users to interact with decentralized finance services, including:

- Swap: Execute token swaps with optimal routing.
- Limit Order: Set orders to buy/sell at predefined price points.
- DCA (Dollar-Cost Averaging): Automate periodic token purchases.
- Wallet Tracking: Monitor and analyze wallet portfolios.
- Token tracking.

# Features: 
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
10. GET /api/v1/raydium/aprPools
11. POST /api/v1/dca
12. POST /api/v1/dca/close

## Get Start
To run this project on local:
- Clone this repo: ``` git clone https://github.com/PlutonAi-HQ/swap-be.git ```
- Install dependencies: ``` npm i ```
- Build the project: ``` npm run build ```
- Run the project: ``` node ./dist/index.js ```

## Licence
