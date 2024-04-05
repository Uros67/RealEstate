import { ethers } from "hardhat";
import { getContractFactoryWithSignerAddress } from "hardhat-deploy-ethers/dist/src/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";


const deployEscrow: DeployFunction= async function (hre: HardhatRuntimeEnvironment) {
    const {getNamedAccounts, deployments}= hre;
    const {deploy, log}= deployments;
    // const {deployer, seller, lender, inspector} = await getNamedAccounts();
    const [ deployer, seller, lender, inspector ] = await ethers.getSigners();

    const realEstate= await deployments.get("RealEstateNFT");

    const escrowContract= await deploy("Escrow", {
        from: deployer.address,
        log : true,
        args: [realEstate.address, seller.address, lender.address, inspector.address], 
    });

    console.log(`Escrow contract address is: ${escrowContract.address}`);
}
export default deployEscrow;
deployEscrow.tags= ["all", "escrow"];