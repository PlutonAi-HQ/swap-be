# 🚀Swap API

This project using [Jupiter Station](https://station.jup.ag/docs/) to implement Solana network token swapping 

## POST /jupiterSwap
- Description: Perform a token swap.
- Body Parameters:
  - privateKey(string): User's private key.
  - inputMint(string): The address of the input token.
  - outputMint(string): The address of the output token.
  - inputAmount(number): The address of the output token.
- Ex: swap 1USDC -> SOL
    
  ![image](https://github.com/user-attachments/assets/517ca291-adf1-40c4-a108-21e06913b98d)


- Response: Returns the swap result.
  - Response structure: {code: number, status: boolean, data: string}
  - Successfull: {code: 200, status: true, data: ```transaction_id``` } 
  - Fail: {code: , status: false, data: ```error_message``` } - when the input is wrong or can not submit tx to blockchain (Congestion)
  - ⚠️ Code 500: Submit transaction timeout, neet to retry.
  - Code 403: Do not have enough balance.

  ![image](https://github.com/user-attachments/assets/41a5787a-68bb-41aa-983f-b575e3ef13fc)


## POST /jupiterLimitOrder  value transfer must > $5 ⚠️ Chỗ này lượng sol đổi ra giá usdc phải > $5, usdc input > 5USDC
- Description: Set up a limit order for token swaps.
- Body Parameters:
  - privateKey(string): User's private key.
  - inputMint(string): The address of the input token.
  - outputMint(string): The address of the output token.
  - makingAmount(number): The amount of input token.
  - takingAmount(number): The amount of the output token.
- Ex: create limit order for swap 0.025SOL -> 5.25USDC
  
  ![image](https://github.com/user-attachments/assets/decf068b-adf6-40eb-b012-773b3646e6cd)


- Response: Returns the limit order details.
  - Successfull: {code: 200, status: true, data: ```transaction_id``` } 
  - Fail: {code: , status: false, data: ```error_message``` }
  - Code 403: Do not have enough balance.


## POST /cancelOrders: 
- Description: cancel all the orders
- Body Parameters:
  - privateKey(string): User's private key.
- Response:
  - Successfull: {code: 200, status: true, data: ```transaction_id``` }
  - Fail: {code: , status: false, data: "No matching orders found" }
 
## POST /balance
- Description: Get the balance of the given address.
- Request Body:
  - address: string - Wallet address
  - tokenAddress: string - Token address
- Response:
  - Success: "balance": {
        "code": 200,
        "message": "Get balance successfull!",
        "balance": 3983896
    }
  - Fail:
    - {
        "code": 403,
        "message": "The token address or wallet address is invalid",
        "balance": null}
    - {
      code: 402 && 401,
      message: "This account do not own the token",
      balance: null}

  ![image](https://github.com/user-attachments/assets/eb558133-8f9e-4a22-ace3-6f8e8f39c7d3)



## 📂 Project Structure
- ```src/ultils/init.ts``` : Init the wallet and keypair by giving private key
- ```src/jupiter.ts``` : Jupiter Swap implementation
- ```src/type.ts``` : Types
- ```src/index.ts``` 
