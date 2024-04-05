import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types"

const deployRealEstate: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments} = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const realEstate = await deploy("RealEstateNFT", {
        from: deployer,
        log: true,
    });
    console.log(`RealEstate contract address is: ${realEstate.address}`);
}

export default deployRealEstate;
deployRealEstate.tags = ["all", "realEstate"];