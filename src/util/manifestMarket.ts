// import { PublicKey } from '@solana/web3.js';
// import {
//   ManifestClient,
// } from "@cks-systems/manifest-sdk";
// import {
//   Keypair,
//   sendAndConfirmTransaction,
//   SystemProgram,
//   Transaction,
//   TransactionInstruction,
//   LAMPORTS_PER_SOL
// } from "@solana/web3.js";
// import { init } from './init.js';


// const { connection, keypair } = init('2E5DFNv7z94isfUBUzfNJyLMM6MEXy5s6dtFnAkZQVsVNfdv23Etib8NXDVQy8qq8eCPHEcXHA9NoikdgaokFEd4');

// export async function manifestCreateMarket(
//     baseMint: PublicKey,
//     quoteMint: PublicKey,
//     contract: PublicKey,
//   ): Promise<string[]> {
//     const marketKeypair: Keypair = Keypair.generate();
//     const FIXED_MANIFEST_HEADER_SIZE: number = 256;
//     const createAccountIx: TransactionInstruction = SystemProgram.createAccount({
//          /** Account that will transfer lamports */
//       fromPubkey: keypair.publicKey,
//         /** Account that will receive transferred lamports */
//       newAccountPubkey: marketKeypair.publicKey,
//       space: FIXED_MANIFEST_HEADER_SIZE,
//        /** Amount of lamports to transfer */
//       lamports: LAMPORTS_PER_SOL,
//       programId: contract,
//     });
//     const createMarketIx = ManifestClient["createMarketIx"](
//       keypair.publicKey,
//       baseMint,
//       quoteMint,
//       marketKeypair.publicKey,
//     );
  
//     const tx: Transaction = new Transaction();
//     tx.add(createAccountIx);
//     tx.add(createMarketIx);
//     const signature = await sendAndConfirmTransaction(connection, tx, [
//       keypair,
//       marketKeypair,
//     ]);
//     return [signature, marketKeypair.publicKey.toBase58()];
//   }
