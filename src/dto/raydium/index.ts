export type IGetPoolByAprRequest = {
  selectValue:
    | "liquidity"
    | "apr30d"
    | "apr7d"
    | "apr24h"
    | "volume24h"
    | "volume7d"
    | "volume30d";
  limit: number;
  deepDetail: boolean;
};

export type TokenInfo = {
  chainId: number;
  address: string;
  programId: string;
  logoURI: string;
  symbol: string;
  name: string;
  decimals: number;
  extensions: Record<string, unknown>;
};

export type PoolInfo = {
  volume: number;
  volumeQuote: number;
  volumeFee: number;
  apr: number;
  feeApr: number;
  priceMin: number;
  priceMax: number;
};

export type PoolData = {
  id: string;
  mintA: TokenInfo;
  mintB: TokenInfo;
  rewardDefaultPoolInfos: string;
  rewardDefaultInfos: unknown[];
  raydiumStake: string;
  price: number;
  mintAmountA: number;
  mintAmountB: number;
  feeRate: number;
  openTime: string;
  tvl: number;
  day: PoolInfo;
  week: PoolInfo;
  month: PoolInfo;
  info?: {
    websites:{
      label: string
      url: string
    }[];
    socials: [
      {
        type: string
        url: string;
      }
    ]
  }
};

export type PoolDataResponse = {
  poolId: string;
  price: number;
  mintAmountA: number;
  mintAmountB: number;
  mintA: TokenInfo;
  mintB: TokenInfo;
  tvl: number;
  day: PoolInfo;
  week: PoolInfo;
  month: PoolInfo;
};
