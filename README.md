# NFT Collateral

⚠️ NOTE: This project is currently in demo. OpeanSea API only supports Goerli testnet, and different mainnets. Chainlink Functions is still in early beta and supports only Polygon Mumbai and Sepoilia testnets. 

## Video Submission

## Description

NFT Collateral is created on the scaffold-eth stack. The goal of the dApp is to allow users to deposit NFTs as collateral into a contract. 
By a certain period of time, users must replace their NFT with the appropriate amount of collateral in Ether before they can withdraw their NFT. 

## Use Case

Imagine you are hosting an event and their is an entry fee to get in. I want to get in the event, but all of my money is locked in a Uniswap V3 pool on ETH Mainnet. However, I do have a Bored Ape NFT that is worth quite a bit. Gas fees are super high right now on ETH Mainnet and I really don't want to exit the pool to get liquidity. But what if the event organizers allowed me to deposit my NFT as collateral? 

Then, they could let me into the event, and I can deposit the entrance fee into the contract before the event is over. If the event is over and I haven't deposited the entrance fee, then the event organizers will have ownership of my NFT, and they can choose to liquidate or hold onto it if they'd like. If I do deposit the entrance fee before the event is over, then I can withdraw by Bored Ape from the contract.

## Details

The Collateral of the NFT is uses Chainlink Functions to fetch the ```last_sale``` price from the OpeanSea API. This allows the smart contract to use that price as the current collateral supported by that user. Instead of making the API call on the client side, Chainlink Functions allows this to all be operated on-chain. 

The contract also uses Chainlink Automation/Keepers in order to set the updateInterval, and check if the time is passed by. As soon as the NFT is deposited, the timer starts at which point the user will have a certain amount of time that they can deposit the equiivalent collateral in ETH. If not, they lose their NFT.

## Requirements

Before you begin, you need to install the following tools:
- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-Eth 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/scaffold-eth/se-2.git
cd se-2
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```
This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```
Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the contract component or the example ui in the frontend. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`
- Edit your frontend in `packages/nextjs/pages`
- Edit your deployment scripts in `packages/hardhat/deploy`

## Deploying your Smart Contracts to a Live Network
Once you are ready to deploy your smart contracts, there are a few things you need to adjust.

1. Select the network

By default, ```yarn deploy``` will deploy the contract to the local network. You can change the defaultNetwork in `packages/hardhat/hardhat.config.ts.` You could also simply run ```yarn deploy --network target_network``` to deploy to another network.

Check the `hardhat.config.ts` for the networks that are pre-configured. You can also add other network settings to the `hardhat.config.ts file`. Here are the [Alchemy docs](https://docs.alchemy.com/docs/how-to-add-alchemy-rpc-endpoints-to-metamask) for information on specific networks.

Example: To deploy the contract to the Sepolia network, run the command below:
```
yarn deploy --network sepolia
```

2. Generate a new account or add one to deploy the contract(s) from. Additionally you will need to add your Alchemy API key. Rename `.env.example` to `.env` and fill the required keys.

```
ALCHEMY_API_KEY="",
DEPLOYER_PRIVATE_KEY=""
```

The deployer account is the account that will deploy your contracts. Additionally, the deployer account will be used to execute any function calls that are part of your deployment script.

You can generate a random account / private key with ```yarn generate``` or add the private key of your crypto wallet. ```yarn generate``` will create a random account and add the DEPLOYER_PRIVATE_KEY to the .env file. You can check the generated account with ```yarn account```.

3. Deploy your smart contract(s)

Run the command below to deploy the smart contract to the target network. Make sure to have some funds in your deployer account to pay for the transaction.

```
yarn deploy --network network_name
```
4. Add contract to Chainlink SubID
```
cd functions-hardhat-starter-kit
npx hardhat functions-sub-add --network NETWORK_NAME --subid YOUR_SUBID --contract YOUR_CONTRACT_ADDRESS
```

5. Verify your smart contract

You can verify your smart contract on Etherscan by running:

```
yarn verify --network NETWORK_NAME YOUR_DEPLOYED_CONTRACT_ADDRESS CHAINLINK_FUNCTIONS_ORACLE_ADDRESS CHAINLINK_FUNCTIONS_SUB_ID MINIMUM_AMOUNT
```
