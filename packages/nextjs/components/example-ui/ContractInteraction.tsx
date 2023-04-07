import { useState } from "react";
import { useEffect } from "react";
import request from "../../chainlink/request";
import { Address } from "../scaffold-eth";
import { CopyIcon } from "./assets/CopyIcon";
import { DiamondIcon } from "./assets/DiamondIcon";
import { HareIcon } from "./assets/HareIcon";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { ArrowSmallRightIcon } from "@heroicons/react/24/outline";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const ContractInteraction = () => {
  const [tokenId, setTokenId] = useState("");
  const [nftAddress, setNftAddress] = useState("");
  const [maticAmount, setMaticAmount] = useState("");
  const [latestResponseValue, setLatestResponseValue] = useState("");

  const { address } = useAccount();

  const { data: collateral } = useScaffoldContractRead({
    contractName: "NFTCollateral",
    functionName: "checkCollateral",
    args: [address],
  });

  const { data: minimumAmount } = useScaffoldContractRead({
    contractName: "NFTCollateral",
    functionName: "getMinimumAmount",
  });

  const { data: collateralSufficient } = useScaffoldContractRead({
    contractName: "NFTCollateral",
    functionName: "collateralSufficient",
  });

  const { isLoading, writeAsync } = useScaffoldContractWrite({
    contractName: "NFTCollateral",
    functionName: "depositNFTAsCollateral",
    args: [nftAddress, ethers.BigNumber.from(tokenId)],
  });

  const { isLoading: sendLoading, writeAsync: sendAsync } = useScaffoldContractWrite({
    contractName: "NFTCollateral",
    functionName: "sendMoneyToContract",
    args: ["0x0000000000000000000000000000000000001010", ethers.BigNumber.from(maticAmount)],
  });

  const { data: latestResponse } = useScaffoldContractRead({
    contractName: "NFTCollateral",
    functionName: "latestResponse",
  });

  // const { data: result } = useScaffoldContractRead({
  //   contractName: "NFTCollateral",
  //   functionName: "bytes32ToUint",
  //   args: [latestResponse],
  // });

  useEffect(() => {
    if (latestResponse) {
      setLatestResponseValue(latestResponse.toString());
    }
  }, [latestResponse]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // chainlink functions to fetch price
    const success = await request(nftAddress, tokenId);
    if (success) {
      // TODO bytes to 32uint to read response on chain and reflect
      // asert statement to check latest response == to on chain conversion
      console.log("Client side response: ", latestResponseValue.toString());
      // deposit nft
      await writeAsync();
      console.log("Deposited NFT as collateral");
    }
  };

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendAsync();
  };

  return (
    <div className="flex bg-base-300 relative pb-10">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />
      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className={`mt-10 flex gap-2 max-w-2xl`}>
          <div className="flex gap-5 bg-base-200 bg-opacity-80 z-0 p-7 rounded-2xl shadow-lg">
            <span className="text-3xl">👋🏻</span>
            <div>
              <div>
                <strong className="text-xl">Collateral</strong> for <Address address={address} /> :
              </div>
              <div className="bold text-2xl">{collateral?.toString()} ETH</div>
              <div className="mt-2">
                <div className="bold text-xl">
                  Minimum Deposit: {minimumAmount?.toString()} ETH
                  <br />
                  <br />
                  You {collateralSufficient ? "" : "do not "}have enough collateral to attend the event
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-6xl text-black">Deposit an NFT</span>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="greetingInput">NFT Address:</label>
                <input
                  id="greetingInput"
                  type="text"
                  placeholder="0x...."
                  className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white "
                  value={nftAddress}
                  onChange={e => setNftAddress(e.target.value)}
                />
              </div>
              <div className="mt-5">
                <label htmlFor="nameInput">Token ID:</label>
                <input
                  id="nameInput"
                  type="text"
                  placeholder="0"
                  className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white "
                  value={tokenId}
                  onChange={e => setTokenId(e.target.value)}
                />
              </div>
              <div className="flex rounded-full border border-primary p-1 flex-shrink-0 mt-10 max-w-[fit-content]">
                <div className="flex rounded-full border-2 border-primary p-1">
                  <button
                    type="submit"
                    className={`btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${
                      isLoading ? "loading" : ""
                    }`}
                  >
                    {!isLoading && (
                      <>
                        Send <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-2xl text-black">Send Matic To Contract</span>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <form onSubmit={handleSend}>
              <div>
                <label htmlFor="greetingInput">Amount</label>
                <input
                  id="greetingInput"
                  type="text"
                  placeholder="0"
                  className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white "
                  value={maticAmount}
                  onChange={e => setMaticAmount(e.target.value)}
                />
              </div>
              <div className="flex rounded-full border border-primary p-1 flex-shrink-0 mt-10 max-w-[fit-content]">
                <div className="flex rounded-full border-2 border-primary p-1">
                  <button
                    type="submit"
                    className={`btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${
                      sendLoading ? "loading" : ""
                    }`}
                  >
                    {!sendLoading && (
                      <>
                        Send <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
