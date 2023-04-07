import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseEther } from "ethers/lib/utils";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const oracleAddress = "0xeA6721aC65BCeD841B8ec3fc5fEdeA6141a0aDE4";
  const updateInterval = "3600";
  const minimumAmount = parseEther("0.00001");

  // Set your contract name.
  const contractName = "NFTCollateral";
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy(contractName, {
    from: deployer,
    // Contract constructor arguments
    args: [oracleAddress, updateInterval, minimumAmount],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  console.log("Deployed Functions Consumer address:", (await hre.deployments.get(contractName)).address);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["NFTCollateral", "all"];
