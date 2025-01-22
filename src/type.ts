export type ISwapReqest = {
  privateKey: string;
  inputMint: string;
  outputMint: string;
  inputAmount: number;
};

export type ILimitOrder = {
  privateKey: string; // user wallet
  makingAmount: number; // amount of token to sell
  takingAmount: number; // amount of token to buy
  inputMint: string; // input token mint address
  outputMint: string; // output token mint address
};

//   new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // USDC
//   0.01, // 100 USDC
//   new PublicKey("So11111111111111111111111111111111111111112"), // SOL
//   100, // 1% slippage
//   20000000,
//   wallet,
//   keypair,
