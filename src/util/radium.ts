// import { clusterApiUrl, Connection } from "@solana/web3.js";
// import { Transaction, VersionedTransaction, sendAndConfirmTransaction } from '@solana/web3.js'
// import { NATIVE_MINT } from '@solana/spl-token'
// import axios from 'axios'
// import { API_URLS, parseTokenAccountResp  } from '@raydium-io/raydium-sdk-v2'
// import { Keypair } from "@solana/web3.js";
// import {connection, keypair} from './init.js'
// import { PublicKey } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
// interface SwapCompute {
//     id: string
//     success: true
//     version: 'V0' | 'V1'
//     openTime?: undefined
//     msg: undefined
//     data: {
//       swapType: 'BaseIn' | 'BaseOut'
//       inputMint: string
//       inputAmount: string
//       outputMint: string
//       outputAmount: string
//       otherAmountThreshold: string
//       slippageBps: number
//       priceImpactPct: number
//       routePlan: {
//         poolId: string
//         inputMint: string
//         outputMint: string
//         feeMint: string
//         feeRate: number
//         feeAmount: string
//       }[]
//     }
//   }

// const owner: Keypair = keypair;

// export const fetchTokenAccountData = async () => {
//     // const solAccountResp = await connection.getAccountInfo(owner.publicKey)
//     // const tokenAccountResp = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_PROGRAM_ID })
//     // const token2022Req = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_2022_PROGRAM_ID })
//     // const tokenAccountData = parseTokenAccountResp({
//     //   owner: owner.publicKey,
//     //   solAccountResp,
//     //   tokenAccountResp: {
//     //     context: tokenAccountResp.context,
//     //     value: [...tokenAccountResp.value, ...token2022Req.value],
//     //   },
//     // })
//     // return tokenAccountData
//   }

// export async function radiumTrade(inputMint: PublicKey, outputMint: PublicKey, amount: number, slippage: number, txVersion: string) {
//     //  const isV0Tx = txVersion === 'V0'
//     // const { data } = await axios.get<{
//     //     id: string
//     //     success: boolean
//     //     data: { default: { vh: number; h: number; m: number } }
//     //   }>(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`)
    
    
//     // const { data: swapResponse } = await axios.get<SwapCompute>(
//     //     `${
//     //       API_URLS.SWAP_HOST
//     //     }/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${
//     //       slippage * 100}&txVersion=${txVersion}`
//     //   ) // Use the URL xxx/swap-base-in or xxx/swap-base-out to define the swap type. 


//     //   const { data: swapTransactions } = await axios.post<{
//     //     id: string
//     //     version: string
//     //     success: boolean
//     //     data: { transaction: string }[]
//     //   }>(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
//     //     computeUnitPriceMicroLamports: String(data.data.default.h),
//     //     swapResponse,
//     //     txVersion,
//     //     wallet: owner.publicKey.toBase58(),
//     //     wrapSol: true,
//     //     unwrapSol: false, // true means output mint receive sol, false means output mint received wsol
//     //     inputAccount: inputMint?.toBase58(),
//     //     outputAccount: outputMint?.toBase58(),
//     //   })


//     //   console.log('swapTransactions', swapTransactions)
//     //   const allTxBuf = swapTransactions.data.map((tx) => Buffer.from(tx.transaction, 'base64'))
//     //   const allTransactions = allTxBuf.map((txBuf) =>
//     //     isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf)
//     //   )
    
//     //   console.log(`total ${allTransactions.length} transactions`, swapTransactions)
    
//     //   let idx = 0
//     //   if (!isV0Tx) {
//     //     for (const tx of allTransactions) {
//     //       console.log(`${++idx} transaction sending...`)
//     //       const transaction = tx as Transaction
//     //       transaction.sign(owner)
//     //       const txId = await sendAndConfirmTransaction(connection, transaction, [owner], { skipPreflight: true })
//     //       console.log(`${++idx} transaction confirmed, txId: ${txId}`)
//     //     }
//     //   } else {
//     //     for (const tx of allTransactions) {
//     //       idx++
//     //       const transaction = tx as VersionedTransaction
//     //       transaction.sign([owner])
//     //       const txId = await connection.sendTransaction(tx as VersionedTransaction, { skipPreflight: true })
//     //       const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash({
//     //         commitment: 'finalized',
//     //       })
//     //       console.log(`${idx} transaction sending..., txId: ${txId}`)
//     //       await connection.confirmTransaction(
//     //         {
//     //           blockhash,
//     //           lastValidBlockHeight,
//     //           signature: txId,
//     //         },
//     //         'confirmed'
//     //       )
//     //       console.log(`${idx} transaction confirmed`)
//     //       return  txId;
//     //     }
//     //   }

//     const isV0Tx = txVersion === 'V0'
  
//     const [isInputSol, isOutputSol] = [inputMint.toBase58() === NATIVE_MINT.toBase58(), outputMint.toBase58() === NATIVE_MINT.toBase58()]
  
//     const { tokenAccounts } = await fetchTokenAccountData()
//     const inputTokenAcc = tokenAccounts.find((a) => a.mint.toBase58() === inputMint.toBase58())?.publicKey
//     const outputTokenAcc = tokenAccounts.find((a) => a.mint.toBase58() === outputMint.toBase58())?.publicKey
  
//     if (!inputTokenAcc && !isInputSol) {
//       console.error('do not have input token account')
//       return
//     }
  
//     // get statistical transaction fee from api
//     /**
//      * vh: very high
//      * h: high
//      * m: medium
//      */
//     const { data } = await axios.get<{
//       id: string
//       success: boolean
//       data: { default: { vh: number; h: number; m: number } }
//     }>(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`)
  
//     const { data: swapResponse } = await axios.get<SwapCompute>(
//       `${
//         API_URLS.SWAP_HOST
//       }/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${
//         slippage * 100
//       }&txVersion=${txVersion}`
//     )
  
//     const { data: swapTransactions } = await axios.post<{
//       id: string
//       version: string
//       success: boolean
//       data: { transaction: string }[]
//     }>(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
//       computeUnitPriceMicroLamports: String(data.data.default.h),
//       swapResponse,
//       txVersion,
//       wallet: owner.publicKey.toBase58(),
//       wrapSol: isInputSol,
//       unwrapSol: isOutputSol, // true means output mint receive sol, false means output mint received wsol
//       inputAccount: isInputSol ? undefined : inputTokenAcc?.toBase58(),
//       outputAccount: isOutputSol ? undefined : outputTokenAcc?.toBase58(),
//     })
  
//     const allTxBuf = swapTransactions.data.map((tx) => Buffer.from(tx.transaction, 'base64'))
//     const allTransactions = allTxBuf.map((txBuf) =>
//       isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf)
//     )
  
//     console.log(`total ${allTransactions.length} transactions`, swapTransactions)
  
//     let idx = 0
//     if (!isV0Tx) {
//       for (const tx of allTransactions) {
//         console.log(`${++idx} transaction sending...`)
//         const transaction = tx as Transaction
//         transaction.sign(owner)
//         const txId = await sendAndConfirmTransaction(connection, transaction, [owner], { skipPreflight: true })
//         console.log(`${++idx} transaction confirmed, txId: ${txId}`)
//       }
//     } else {
//       for (const tx of allTransactions) {
//         idx++
//         const transaction = tx as VersionedTransaction
//         transaction.sign([owner])
//         const txId = await connection.sendTransaction(tx as VersionedTransaction, { skipPreflight: true })
//         const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash({
//           commitment: 'finalized',
//         })
//         console.log(`${idx} transaction sending..., txId: ${txId}`)
//         await connection.confirmTransaction(
//           {
//             blockhash,
//             lastValidBlockHeight,
//             signature: txId,
//           },
//           'confirmed'
//         )
//         console.log(`${idx} transaction confirmed`)
//       }
//     }
  
// }