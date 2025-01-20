import { Wallet } from "@project-serum/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import baseX from 'base-x';


export const connection = new Connection(clusterApiUrl("mainnet-beta"));


export const init = (privateKey: string) => {
    const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'; 
    const base58 = baseX(BASE58_ALPHABET);
    const secretKey = base58.decode(privateKey);
    const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    const wallet = new Wallet(keypair)

    return {keypair, wallet}
    // Create a Keypair from the decoded secret key
}