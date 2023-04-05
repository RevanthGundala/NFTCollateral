// Loads environment variables from .env file (if it exists)
const source =
  "const nftAddress = args[0];const tokenId = args[1];const openSeaRequest = Functions.makeHttpRequest({url: `https://testnets-api.opensea.io/api/v1/asset/${nftAddress}/${tokenId}/`,});const openSeaResponse = await openSeaRequest;const salePrice = parseInt(openSeaResponse.data.last_sale.total_price);return Functions.encodeUint256(salePrice);";

const Location = {
  Inline: 0,
  Remote: 1,
};

const CodeLanguage = {
  JavaScript: 0,
};

const ReturnType = {
  uint: "uint256",
  uint256: "uint256",
  int: "int256",
  int256: "int256",
  string: "string",
  bytes: "Buffer",
  Buffer: "Buffer",
};

// Configure the request by setting the fields below
const getRequestConfig = (nftAddress, tokenId) => {
  return {
    // location of source code (only Inline is curently supported)
    codeLocation: Location.Inline,
    // location of secrets (Inline or Remote)
    secretsLocation: Location.Inline,
    // code language (only JavaScript is currently supported)
    codeLanguage: CodeLanguage.JavaScript,
    // string containing the source code to be executed
    source: source,
    // ETH wallet key used to sign secrets so they cannot be accessed by a 3rd party
    walletPrivateKey: process.env["NEXT_PRIVATE_KEY"],
    // args can be accessed within the source code with `args[index]` (ie: args[0])
    args: [`${nftAddress}`, `${tokenId}`],
    // expected type of the returned value
    expectedReturnType: ReturnType.uint256,
  };
};

module.exports = getRequestConfig;
