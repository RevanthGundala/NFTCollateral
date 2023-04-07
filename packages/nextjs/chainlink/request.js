const ethers = require("ethers"); // v6

async function request(nftAddress, tokenId) {
  // Provider config currently set for Polygon Mumbai
  // Optionally use one of the other ethers providers
  // https://docs.ethers.org/v6/api/providers/

  const MUMBAI_RPC_URL = "https://rpc-mumbai.maticvigil.com/";

  let provider;
  try {
    // Try Ethers v6 provider
    provider = new ethers.JsonRpcProvider(MUMBAI_RPC_URL);
  } catch (e) {
    if (e instanceof TypeError) {
      // Try Ethers v5 provider
      provider = new ethers.providers.Web3Provider(window.ethereum);
    } else {
      console.log(e);
    }
  }

  const signer = await provider.getSigner();
  // Consumer contract
  const consumerAddress = "0xE0Cf72Ce256439a232441b6Ed456E1Cef38C421f";
  const contractAbi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "oracle",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_updateInterval",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_minimumAmount",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "EmptyArgs",
      type: "error",
    },
    {
      inputs: [],
      name: "EmptySecrets",
      type: "error",
    },
    {
      inputs: [],
      name: "EmptySource",
      type: "error",
    },
    {
      inputs: [],
      name: "RequestIsAlreadyPending",
      type: "error",
    },
    {
      inputs: [],
      name: "RequestIsNotPending",
      type: "error",
    },
    {
      inputs: [],
      name: "SenderIsNotRegistry",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "time",
          type: "uint256",
        },
      ],
      name: "NFTDeposited",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "time",
          type: "uint256",
        },
      ],
      name: "NFTWithdrawn",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "requestId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "result",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "err",
          type: "bytes",
        },
      ],
      name: "OCRResponse",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "OwnershipTransferRequested",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "id",
          type: "bytes32",
        },
      ],
      name: "RequestFulfilled",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "id",
          type: "bytes32",
        },
      ],
      name: "RequestSent",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "Withdrawn",
      type: "event",
    },
    {
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "data",
          type: "bytes32",
        },
      ],
      name: "bytes32ToUint",
      outputs: [
        {
          internalType: "uint256",
          name: "result",
          type: "uint256",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_addr",
          type: "address",
        },
      ],
      name: "checkCollateral",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      name: "checkUpkeep",
      outputs: [
        {
          internalType: "bool",
          name: "upkeepNeeded",
          type: "bool",
        },
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "collateralSufficient",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "token",
          type: "address",
        },
      ],
      name: "convertERC20toETH",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "depositNFTAsCollateral",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "enum Functions.Location",
              name: "codeLocation",
              type: "uint8",
            },
            {
              internalType: "enum Functions.Location",
              name: "secretsLocation",
              type: "uint8",
            },
            {
              internalType: "enum Functions.CodeLanguage",
              name: "language",
              type: "uint8",
            },
            {
              internalType: "string",
              name: "source",
              type: "string",
            },
            {
              internalType: "bytes",
              name: "secrets",
              type: "bytes",
            },
            {
              internalType: "string[]",
              name: "args",
              type: "string[]",
            },
          ],
          internalType: "struct Functions.Request",
          name: "req",
          type: "tuple",
        },
        {
          internalType: "uint64",
          name: "subscriptionId",
          type: "uint64",
        },
        {
          internalType: "uint32",
          name: "gasLimit",
          type: "uint32",
        },
        {
          internalType: "uint256",
          name: "gasPrice",
          type: "uint256",
        },
      ],
      name: "estimateCost",
      outputs: [
        {
          internalType: "uint96",
          name: "",
          type: "uint96",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "source",
          type: "string",
        },
        {
          internalType: "bytes",
          name: "secrets",
          type: "bytes",
        },
        {
          internalType: "enum Functions.Location",
          name: "secretsLocation",
          type: "uint8",
        },
        {
          internalType: "string[]",
          name: "args",
          type: "string[]",
        },
        {
          internalType: "uint64",
          name: "subscriptionId",
          type: "uint64",
        },
        {
          internalType: "uint32",
          name: "gasLimit",
          type: "uint32",
        },
      ],
      name: "executeRequest",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address",
        },
      ],
      name: "getAddressBalanceinERC20",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAddressBalanceinETH",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getDONPublicKey",
      outputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "token",
          type: "address",
        },
      ],
      name: "getLatestPrice",
      outputs: [
        {
          internalType: "int256",
          name: "",
          type: "int256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getMaticBalanceInETH",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getMinimumAmount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getOwner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "token",
          type: "address",
        },
      ],
      name: "getTotalValueLocked",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getUpKeepFinished",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getWithdrawAllowed",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "requestId",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "response",
          type: "bytes",
        },
        {
          internalType: "bytes",
          name: "err",
          type: "bytes",
        },
      ],
      name: "handleOracleFulfillment",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "lastUpkeepTimeStamp",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "latestError",
      outputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "latestRequestId",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "latestResponse",
      outputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      name: "onERC721Received",
      outputs: [
        {
          internalType: "bytes4",
          name: "",
          type: "bytes4",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      name: "performUpkeep",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "updateInterval",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
      ],
      name: "withdrawNFT",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
  ];

  const consumerContract = new ethers.Contract(consumerAddress, contractAbi, signer);

  // Transaction config
  const gasLimit = 250000; // Transaction gas limit
  const verificationBlocks = 2; // Number of blocks to wait for transaction

  // Chainlink Functions request config
  // Chainlink Functions subscription ID
  const subscriptionId = 426;
  // Gas limit for the Chainlink Functions request
  const requestGas = 5500000;

  // Default example
  const source =
    "const nftAddress = args[0];const tokenId = args[1];const openSeaRequest = Functions.makeHttpRequest({url: `https://testnets-api.opensea.io/api/v1/asset/${nftAddress}/${tokenId}/`,});const openSeaResponse = await openSeaRequest;const salePrice = parseInt(openSeaResponse.data.last_sale.total_price);return Functions.encodeUint256(salePrice);";
  const args = [`${nftAddress}`, `${tokenId}`];

  // Submit the request
  // Order of the parameters is critical
  const overrides = {
    gasLimit: 500000,
  };
  const requestTx = await consumerContract.executeRequest(
    source,
    "0x",
    0, // 0 for inline, 1 for off-chain
    args ?? [], // Chainlink Functions request args
    subscriptionId, // Subscription ID
    gasLimit, // Gas limit for the transaction
    overrides,
  );

  // If a response is not received within 5 minutes, the request has failed
  setTimeout(
    () =>
      reject(
        "A response not received within 5 minutes of the request " +
          "being initiated and has been canceled. Your subscription " +
          "was not charged. Please make a new request.",
      ),
    300_000,
  );
  console.log(`Waiting ${verificationBlocks} blocks for transaction ` + `${requestTx.hash} to be confirmed...`);

  // TODO: Need a better way to print this. Works on some requests and not others
  // Doesn't handle subscription balance errors correctly
  const requestTxReceipt = await requestTx.wait(verificationBlocks);
  let requestId;
  try {
    // Try ethers v6 logs
    requestId = requestTxReceipt.logs[2].args.id;
    console.log(`\nRequest ${requestId} initiated`);
  } catch (e) {
    if (e instanceof TypeError) {
      // Try ethers v5 events
      requestId = requestTxReceipt.events[2].args.id;
      console.log(requestId);
    } else {
      console.log(e);
      console.log("Could not read tx receipt. Skipping...");
    }
  }

  console.log(`Waiting for fulfillment...\n`);

  // TODO: Detect when the fulfillment is done rather than pausing
  await new Promise(r => setTimeout(r, 30000));

  // Check for errors
  let latestError = await consumerContract.latestError();
  if (latestError.length > 0 && latestError !== "0x") {
    window.alert(`\nOn-chain error message: ${Buffer.from(latestError.slice(2), "hex").toString()}`);
    return false;
  }

  // Decode and print the latest response
  let latestResponse = await consumerContract.latestResponse();
  if (latestResponse.length > 0 && latestResponse !== "0x") {
    latestResponse = BigInt(await latestResponse).toString();
    console.log("Stored value is: " + latestResponse);
  }

  return true;
}

export default request;
