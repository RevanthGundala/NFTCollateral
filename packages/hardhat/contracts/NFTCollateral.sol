// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./dev/functions/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// what is the idea?
// the idea is to allow nice people that if they didn't pay for a ticket on time,
// offer collateral in the form of an nft (check the price of the nft to see if it is greater or equal to price)
// deposit that collateral into smart contract, if the smart contract doesn't receive funds that match that nft within 1 day
// sell that nft, if it does receive funds, send nft back to the user

// convert price of ethi ncontract to matic using chainlnik price feeds

contract NFTCollateral is AutomationCompatibleInterface, IERC721Receiver, FunctionsClient, ConfirmedOwner {
  using Functions for Functions.Request;
  //Chainlnik pricefeed variables
  address private constant matic_usd_pricefeed = 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;
  address private constant eth_usd_pricefeed = 0x0715A7794a1dc8e42615F059dD6e406A6594651A;
  address private constant maticTokenAddress = 0x0000000000000000000000000000000000001010;
  AggregatorV3Interface internal priceFeedMaticUSD;
  AggregatorV3Interface internal priceFeedETHUSD;

  // Chainlink functions variables
  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;

  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  // Chainlink keepers variables
  uint256 public updateInterval;
  uint256 public lastUpkeepTimeStamp;

  // Contract variables
  uint private immutable minimumAmount;
  bool private withdrawAllowed;
  bool private upKeepFinished;
  address private s_owner;
  uint256 private maticBalanceInETHInContract;

  mapping(address => mapping(address => mapping(uint => bool))) private userDepositedNFT;
  mapping(address => uint) private collateral;
  mapping(address => mapping(uint => uint)) private priceOfNFT;

  event NFTDeposited(address nftAddress, uint tokenId, uint time);
  event NFTWithdrawn(address nftAddress, uint tokenId, uint time);
  event Withdrawn(uint amount, address owner);

  constructor(
    address oracle,
    uint _updateInterval,
    uint _minimumAmount
  ) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {
    updateInterval = _updateInterval;
    minimumAmount = _minimumAmount;
    withdrawAllowed = false;
    s_owner = msg.sender;
    upKeepFinished = false;
    priceFeedMaticUSD = AggregatorV3Interface(matic_usd_pricefeed);
    priceFeedETHUSD = AggregatorV3Interface(eth_usd_pricefeed);
  }

  modifier onlyOwner() override {
    require(s_owner == msg.sender, "You are not owner of contract");
    _;
  }

  modifier isNotDeposited(address nftAddress, uint tokenId) {
    require(userDepositedNFT[msg.sender][nftAddress][tokenId] == false, "You have already deposited");
    _;
  }

  modifier isNFTOwner(address nftAddress, uint256 tokenId) {
    require(IERC721(nftAddress).ownerOf(tokenId) == msg.sender, "Not the owner of NFT");
    _;
  }

  function executeRequest(
    string calldata source,
    bytes calldata secrets,
    Functions.Location secretsLocation,
    string[] calldata args,
    uint64 subscriptionId,
    uint32 gasLimit
  ) public onlyOwner returns (bytes32) {
    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    if (secrets.length > 0) {
      if (secretsLocation == Functions.Location.Inline) {
        req.addInlineSecrets(secrets);
      } else {
        req.addRemoteSecrets(secrets);
      }
    }
    if (args.length > 0) req.addArgs(args);

    bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
    latestRequestId = assignedReqID;
    return assignedReqID;
  }

  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    latestResponse = response;
    latestError = err;
    emit OCRResponse(requestId, response, err);
  }

  function getLatestPrice(address token) public view returns (int) {
    AggregatorV3Interface priceFeed;
    require(token == maticTokenAddress, "Token not supported");
    priceFeed = priceFeedMaticUSD;
    // prettier-ignore
    (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
    return price;
  }

  function bytes32ToUint(bytes32 data) public pure returns (uint256 result) {
    bytes memory myBytesValue = abi.encodePacked(data);
    assembly {
      result := mload(add(myBytesValue, 32))
    }
  }

  function depositNFTAsCollateral(
    address nftAddress,
    uint tokenId
  ) external isNFTOwner(nftAddress, tokenId) isNotDeposited(nftAddress, tokenId) {
    IERC721 nft = IERC721(nftAddress);
    require(nft.getApproved(tokenId) == address(this), "No approval for NFT");
    nft.safeTransferFrom(msg.sender, address(this), tokenId);
    require(latestResponse.length != 0, "Error in fetching price");
    priceOfNFT[nftAddress][tokenId] = bytes32ToUint(bytes32(latestResponse));
    userDepositedNFT[msg.sender][nftAddress][tokenId] = true;
    collateral[msg.sender] += priceOfNFT[nftAddress][tokenId];
    latestResponse = "";
    lastUpkeepTimeStamp = block.timestamp;
    emit NFTDeposited(nftAddress, tokenId, block.timestamp);
  }

  function checkUpkeep(
    bytes calldata /* checkData */
  ) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
    upkeepNeeded = (block.timestamp - lastUpkeepTimeStamp) > updateInterval; // check if at least a day has passed
  }

  // perform upkeep should check if the ETH/ERC20 tokens is in the contract
  function performUpkeep(bytes calldata /* performData */) external override {
    // perform your task here
    require(block.timestamp - lastUpkeepTimeStamp > updateInterval, "Upkeep isn't needed");
    upKeepFinished = true;
    if (address(this).balance + maticBalanceInETHInContract - minimumAmount >= 0) {
      // allow withdrawal
      withdrawAllowed = true;
    }
  }

  // owner should be able to withdraw if time is up, else only user should
  function withdrawNFT(uint tokenId, address nftAddress) external {
    if (msg.sender == s_owner) {
      require(withdrawAllowed == false && upKeepFinished, "Withraw is only allowed for owner if time is up");
    } else {
      bool userIsInitialOwner = userDepositedNFT[msg.sender][nftAddress][tokenId];
      require(withdrawAllowed, "You cannot withdraw yet");
      require(userIsInitialOwner, "You are not the initial owner of this nft");
    }

    IERC721 nft = IERC721(nftAddress);
    nft.safeTransferFrom(address(this), msg.sender, tokenId);

    // update mappings if initial owner withdraws
    if (msg.sender != s_owner) {
      userDepositedNFT[msg.sender][nftAddress][tokenId] = false;
      collateral[msg.sender] -= priceOfNFT[nftAddress][tokenId];
    }
    emit NFTWithdrawn(nftAddress, tokenId, block.timestamp);
  }

  function convertERC20toETH(address token) public returns (uint) {
    require(token == maticTokenAddress, "Only MATIC is supported");
    uint priceUSDinMATIC = uint(getLatestPrice(maticTokenAddress));
    uint priceUSDinETH;
    (
      ,
      /* uint80 roundID */ int price /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
      ,
      ,

    ) = priceFeedETHUSD.latestRoundData();
    priceUSDinETH = uint(price);
    uint maticBalance = IERC20(maticTokenAddress).balanceOf(address(this));
    uint valueOfMaticUSDInContract = priceUSDinMATIC * maticBalance;
    uint valueOfMaticETHInContract = valueOfMaticUSDInContract * ((1 * 10 ** 18) / priceUSDinETH);
    maticBalanceInETHInContract = valueOfMaticETHInContract;
    return valueOfMaticETHInContract;
  }

  function withdraw() external virtual onlyOwner {
    uint totalBalance = getTotalValueLocked(maticTokenAddress);
    (bool success, ) = msg.sender.call{value: address(this).balance}("");
    require(success, "Withdraw of ETH failed");
    IERC20(maticTokenAddress).transfer(msg.sender, IERC20(maticTokenAddress).balanceOf(address(this)));
    emit Withdrawn(totalBalance, msg.sender);
  }

  function checkCollateral(address _addr) public view returns (uint) {
    return collateral[_addr];
  }

  function collateralSufficient() external view returns (bool) {
    return collateral[msg.sender] >= minimumAmount;
  }

  function getUpKeepFinished() external view returns (bool) {
    return upKeepFinished;
  }

  function getTotalValueLocked(address token) public view returns (uint) {
    return address(this).balance + maticBalanceInETHInContract;
  }

  function getMinimumAmount() external view returns (uint) {
    return minimumAmount;
  }

  function getWithdrawAllowed() external view returns (bool) {
    return withdrawAllowed;
  }

  function onERC721Received(address, address, uint256, bytes memory) public pure override returns (bytes4) {
    return this.onERC721Received.selector;
  }

  function getOwner() external view returns (address) {
    return s_owner;
  }

  function getAddressBalanceinETH() external view returns (uint) {
    return address(this).balance;
  }

  function getAddressBalanceinERC20(address _tokenAddress) external view returns (uint) {
    return IERC20(_tokenAddress).balanceOf(address(this));
  }

  function getMaticBalanceInETH() external view returns (uint) {
    return maticBalanceInETHInContract;
  }

  receive() external payable {}
}

// 3. test backend
// 4. deploy keepers on the app + test keepers
// 5. bs the frontend
// 6. Think about the best way to demo this
