# 🚀Swap API

This project using [Jupiter Station](https://station.jup.ag/docs/) to implement Solana network token swapping 


## GET /jupiterSwap
- Description: Perform a token swap.
- Body Parameters:
  - privateKey(string): User's private key.
  - inputMint(string): The address of the input token.
  - outputMint(string): The address of the output token.
  - inputAmount(number): The address of the output token.
- Ex: swap 2USDC -> SOL
    
  ![image](https://github.com/user-attachments/assets/e513941a-90c3-4b41-b428-9ba5fd5061e6)

- Response: Returns the swap result.
  - Successfull: {status: true, data: ```transaction_id``` } 
  - Fail: {status: false, data: ```error_message``` } - when the input is wrong or can not submit tx to blockchain (Congestion)
 ![image](https://github.com/user-attachments/assets/d02620f2-9771-4908-b3b7-ab1e767aae91)

## GET /jupiterLimitOrder  value transfer must > $5
- Description: Set up a limit order for token swaps.
- Body Parameters:
  - privateKey(string): User's private key.
  - inputMint(string): The address of the input token.
  - outputMint(string): The address of the output token.
  - makingAmount(number): The amount of input token.
  - takingAmount(number): The amount of the output token.
- Ex: create limit order for swap 0.025SOL -> 5.25USDC
  
  ![image](https://github.com/user-attachments/assets/56dea66d-90af-4ddf-8bd4-37c7a7abef9f)

  
- Response: Returns the limit order details.
  - Successfull: {status: true, data: ```transaction_id``` } 
  - Fail: {status: false, data: ```error_message``` } - when the input is wrong or can not submit tx to blockchain (Congestion)

## 📂 Project Structure
- ```src/ultils/init.ts``` : Init the wallet and keypair by giving private key
- ```src/jupiter.ts``` : Jupiter Swap implementation
- ```src/type.ts``` : Types
- ```src/index.ts``` 
