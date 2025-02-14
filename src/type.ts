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

export type ILimitRateCheck = {
  inputMint: string; // input token mint address
  outputMint: string; // output token mint address
  inputAmount: number; // amount of input token
  outputAmount: number; // amount of output token
};

export type IToken = {
  symbol: string;
  address: string;
  decimals: number;
};

export type CreateOrder = {
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

export type GetLimitOrders = {
  maker: string;
  computeUnitPrice: "auto";
};

export type TokenDetails = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  daily_volume: number;
  created_at: string;
  freeze_authority: string | null;
  mint_authority: string | null;
  permanent_delegate: string | null;
  minted_at: string;
  extensions: {
    coingeckoId: string;
  };
};

export type CancelOrders = {
  maker: string;

  // "auto" sets the priority fee based on network congestion
  // and it will be capped at 500,000
  computeUnitPrice: string | "auto";

  // Specific order account public keys to cancel/close
  orders?: string[] | undefined;
};

//   new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // USDC
//   0.01, // 100 USDC
//   new PublicKey("So11111111111111111111111111111111111111112"), // SOL
//   100, // 1% slippage
//   20000000,
//   wallet,
//   keypair,
