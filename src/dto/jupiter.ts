import { Wallet } from "@project-serum/anchor";

export type ICreateDCARequest = {
  privateKey: string;
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  timeHoursCircle: number;
  amountPerCircle: number;
};
export type IWidrawDCARequest = {
  privateKey: string;
  inputMint: string;
  amount: number;
  dcaPublickey: string;
};

export type ICancleDCA = {
  privateKey: string;
  dcaPublickey: string;
};
