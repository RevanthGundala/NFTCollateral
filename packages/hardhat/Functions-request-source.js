const nftAddress = args[0];
const tokenId = args[1];

const openSeaRequest = Functions.makeHttpRequest({
  url: `https://testnets-api.opensea.io/api/v1/asset/${nftAddress}/${tokenId}/`,
});

const openSeaResponse = await openSeaRequest;

const salePrice = parseInt(openSeaResponse.data.last_sale.total_price);
return Functions.encodeUint256(salePrice);
