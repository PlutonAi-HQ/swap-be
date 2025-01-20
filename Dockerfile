# # Step 1: Use an official Node.js runtime as a parent image
FROM node:18

# # Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# # Step 3: Copy the package.json and package-lock.json files
COPY package*.json ./

# # Step 4: Install the dependencies
RUN npm install

# Install Sui CLI



# Create necessary directories and configuration files
RUN mkdir -p /root/.sui/sui_config && \ 
    echo "keystore:\n  File: /root/.sui/sui_config/sui.keystore\nenvs:\n  - alias: devnet\n    rpc: https://fullnode.devnet.sui.io:443\n    ws: wss://fullnode.devnet.sui.io:443\nactive_env: devnet" > /root/.sui/sui_config/client.yaml && \
    touch /root/.sui/sui_config/sui.keystore && \ 
    echo "[\n\"ABpFz2CXBIdOaMuAMOjjJwhJkxdZ6MEaaQoDOR3HSOJj\"\n]" > /root/.sui/sui_config/sui.keystore && \ 
    touch /root/.sui/sui_config/sui.aliases && \
    echo "[ \n { \n\"alias\": \"vigilant-zircon\",\n \"public_key_base64\": \"ALr8+dylfw/0EzYOsU7p4wFMUPAsgW3LAYVE2RsgvmeD\" \n} \n]" > /root/.sui/sui_config/sui.aliases
# RUN tar -xzvf sui-devnet-v1.37.0-ubuntu-x86_64.tgz && \
#     rm sui-devnet-v1.37.0-ubuntu-x86_64.tgz && \
#     mv sui /usr/local/bin/sui && \
#     chmod +x /usr/local/bin/sui

#     # Step 6: Initialize Sui configuration non-interactively
#     # Here, the -y flag automatically confirms any prompts.
#     RUN mkdir -p /root/.sui/sui_config && \
#     echo "y" | sui client active-address || true
    
# RUN sui/sui genesis

# RUN sui/sui client switch --env devnet

# RUN ls -a
# RUN sui/sui --version
# RUN rustup update stable


# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Compile TypeScript files
RUN npx tsc

# Step 7: Expose the port the app runs on
EXPOSE 3006

# Step 8: Define the command to run the app
CMD ["npm", "run", "prod"]