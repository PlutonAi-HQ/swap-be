# 🚀Swap API

This project using [Jupiter Station](https://station.jup.ag/docs/) to implement Solana network token swapping 


## POST /jupiterSwap
- Description: Perform a token swap.
- Body Parameters:
  - privateKey(string): User's private key.
  - inputMint(string): The address of the input token.
  - outputMint(string): The address of the output token.
  - makingAmount(string ex "1000"): The amount of input token.
  - takingAmount(string ex "10000"): The amount of the output token.
- Response: Returns the swap result.
  - Successfull: {status: true, data: ```transaction_id``` } 
  - Fail: {status: false, data: ```error_message``` } - when the input is wrong or can not submit tx to blockchain (Congestion)
 ![image](https://github.com/user-attachments/assets/d02620f2-9771-4908-b3b7-ab1e767aae91)

## POST /jupiterLimitOrder 
***chưa test được***
- Description: Set up a limit order for token swaps.
- Body Parameters:
  - privateKey(string): User's private key.
  - inputMint(string): The address of the input token.
  - outputMint(string): The address of the output token.
  - inputAmount(string): The address of the output token.
- Response: Returns the limit order details.
  - Successfull: {status: true, data: ```transaction_id``` } 
  - Fail: {status: false, data: ```error_message``` } - when the input is wrong or can not submit tx to blockchain (Congestion)

## 📂 Project Structure
- ```src/ultils/init.ts``` : Init the wallet and keypair by giving private key
- ```src/jupiter.ts``` : Jupiter Swap implementation
- ```src/type.ts``` : Types
- ```src/index.ts``` 
