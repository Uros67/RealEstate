import { expect, assert } from "chai";
import { RealEstateNFT } from "../typechain-types";
import { deployments, ethers } from "hardhat";
import { domainToUnicode } from "url";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { BigNumberish, ContractTransactionResponse, TransactionReceipt } from "ethers";
import { TypedContractEvent, TypedEventLog } from "../typechain-types/common";


describe("RealEstate", async function () {
    let realEstate: RealEstateNFT;
    let buyer: SignerWithAddress, seller: SignerWithAddress, inspector: SignerWithAddress, lender: SignerWithAddress;


    beforeEach(async function () {
        await deployments.fixture("all");
        realEstate = await ethers.getContract("RealEstateNFT");

    })

    describe("constructor", async function () {
        it("Should setup NFT name", async function () {
            //await realEstate.mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const nftName : string = await realEstate.name();
            assert.equal("RealEstate", nftName);
        });



    });
    describe("mint", async function () {
        describe("event",async function () {
        it("Should emit event after minting NFT", async function () {
            [buyer, seller, inspector, lender] = await ethers.getSigners();
            const transaction : ContractTransactionResponse= await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");

            expect(realEstate.connect(seller)
                .mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"))
                .to.emit(realEstate, "Minted")
                .withArgs(seller, 1, "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");

        });
        it("Should set seller for owner", async function () {
            [buyer, seller, inspector, lender] = await ethers.getSigners();
            console.log(`Seller address: ${seller.address}`);

            const txResponse: ContractTransactionResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            const event = events[0];
            const args = event.args;
            console.log(`Tx return: ${args[0]}`);

            assert.equal(seller.address, args[0]);

        })
        it("Should set nft Id", async function () {
            [buyer, seller, inspector, lender] = await ethers.getSigners();
            const transaction: ContractTransactionResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            const event = events[0];
            const args = event.args;

            assert.equal(BigInt(1), args[1]);

        });
        it("Should set nft URI", async function () {
            const transaction : ContractTransactionResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter= realEstate.filters.Minted;
            const events= await realEstate.queryFilter(filter, -1);
            const event= events[0];
            const args= event.args;
            assert.equal("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS", args[2]);
        })
    })
        it("Should increase total supply", async function () {
            [buyer, seller, inspector, lender] = await ethers.getSigners();
            const startingSuply = await realEstate.totalSuply();
            console.log(`Starting supply is: ${startingSuply}`);
            const transaction: ContractTransactionResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const incresedSupply = await realEstate.totalSuply();
            console.log(`End supply is: ${incresedSupply}`);
            assert.notEqual(startingSuply, incresedSupply);

        });
    });

})