import { assert, expect } from "chai";
import { deployments, ethers } from "hardhat";
import { Escrow, RealEstateNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { FunctionFragment } from "ethers";


describe("Escrow", async function () {
    let realEstate: RealEstateNFT;
    let escrow: Escrow;

    let buyer: SignerWithAddress, seller: SignerWithAddress, inspector: SignerWithAddress, lender: SignerWithAddress;


    beforeEach(async function () {
        await deployments.fixture("all");
        realEstate = await ethers.getContract("RealEstateNFT");
        escrow = await ethers.getContract("Escrow");
        [buyer, seller, lender, inspector] = await ethers.getSigners();


    })
    describe("constructor", async function () {
        it("Should setup right nft address", async function () {
            const nftAddress = await escrow.s_nftAddress();
            assert.equal(nftAddress, await realEstate.getAddress())
        });
        it("Should setup right seller address", async function () {
            console.log(`signers seller address: ${seller.address}`);

            const sellerAddress = await escrow.s_seller();
            console.log(`contract seller address: ${sellerAddress}`);

            assert.equal(seller.address, sellerAddress)
        });
        it("Should setup right lender address", async function () {
            console.log(`signers lender address: ${lender.address}`);

            const lenderAddress = await escrow.s_lender();
            console.log(`contract lender address: ${lenderAddress}`);

            assert.equal(lender.address, lenderAddress)
        });
        it("Should setup right inspector address", async function () {
            console.log(`signers inspector address: ${inspector.address}`);

            const inspectorAddress = await escrow.s_inspector();
            console.log(`contract inspector address: ${inspectorAddress}`);

            assert.equal(inspector.address, inspectorAddress)
        });
    });
    describe("list", async function () {
        it("Should revert Only seller", async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            const nftId = events[0].args[1];
            await expect(escrow.list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"))).to.be.revertedWith("Only seller can call this func");
        })
        it("Should change ownership to escrow contract", async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);

            const nftId = events[0].args[1];
            console.log(`NFT id is: ${nftId}`);
            const ownerBefore = await realEstate.ownerOf(nftId);
            console.log(`Owner before: ${ownerBefore}`);
            await realEstate.connect(seller).approve(await escrow.getAddress(), nftId);
            await escrow.connect(seller).list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"));
            const ownerAfter = await realEstate.ownerOf(nftId);
            console.log(`Owner after: ${ownerAfter}`);
            assert.equal(await escrow.getAddress(), ownerAfter);
        })
        it("Should be listed", async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            const nftId = events[0].args[1];
            await realEstate.connect(seller).approve(await escrow.getAddress(), nftId);
            await escrow.connect(seller).list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"));
            assert.equal(await escrow.s_isListed(nftId), true);
        });
        it("Should set purchase price", async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            const nftId = events[0].args[1];
            await realEstate.connect(seller).approve(await escrow.getAddress(), nftId);
            await escrow.connect(seller).list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"));
            assert.equal(await escrow.s_purchasePrice(nftId), ethers.parseEther("10"));
        });
        it("Should set escrow price", async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            const nftId = events[0].args[1];
            await realEstate.connect(seller).approve(await escrow.getAddress(), nftId);
            await escrow.connect(seller).list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"));
            assert.equal(await escrow.s_escrowAmount(nftId), ethers.parseEther("5"));
        });
        it("Should set buyer", async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            const nftId = events[0].args[1];
            await realEstate.connect(seller).approve(await escrow.getAddress(), nftId);
            await escrow.connect(seller).list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"));
            assert.equal(await escrow.s_buyer(nftId), buyer.address);
        });
    })
    describe("deposit ernest", async function () {
        let nftId: bigint;
        beforeEach(async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            nftId = events[0].args[1];
            await realEstate.connect(seller).approve(await escrow.getAddress(), nftId);
            await escrow.connect(seller).list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"));
        })

        it("Should revert onlyBuyer", async function () {
            await expect(escrow.connect(seller).depositEarnest(nftId)).to.be.revertedWith("Only buyer can call this func");
        });
        it("Should revert right amount of earnest", async function () {
            await expect(escrow.connect(buyer).depositEarnest(nftId, { value: ethers.parseEther("3") })).to.be.revertedWith("Amount is to little");
        });
        it("Should increment balance", async function () {
            const balanceBefore = await escrow.getBalance();
            console.log(`balance before: ${balanceBefore}`);
            await escrow.connect(buyer).depositEarnest(nftId, { value: ethers.parseEther("5") });

            const balanceAfter = await escrow.getBalance();
            const compare = balanceAfter > balanceBefore;
            assert.isTrue(compare);
        })
    })
    describe("updateInspectionStatus", async function () {
        let nftId: bigint;
        beforeEach(async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            nftId = events[0].args[1];
            await realEstate.connect(seller).approve(await escrow.getAddress(), nftId);
            await escrow.connect(seller).list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"));
        });
        it("Should revert only Inspector", async function () {
            await expect(escrow.connect(seller).updateInspectionStatus(nftId, true)).to.be.revertedWith("Only inspector can call this func");
        });
        it("Should change inspection status", async function () {
            await escrow.connect(inspector).updateInspectionStatus(nftId, true);
            assert.isTrue(await escrow.s_inspectionPassed(nftId));
        });
    });
    describe("approveSale", async function () {
        let nftId: bigint;
        beforeEach(async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            nftId = events[0].args[1];
            await realEstate.connect(seller).approve(await escrow.getAddress(), nftId);
            await escrow.connect(seller).list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"));
        });
        it("Should change approval status", async function () {
            await escrow.connect(seller).approveSale(nftId);
            assert.isTrue(await escrow.s_approval(nftId, seller));
        })
    });
    describe("finalizeSale", async function () {
        let nftId: bigint;
        beforeEach(async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            nftId = events[0].args[1];
            await realEstate.connect(seller).approve(await escrow.getAddress(), nftId);
            await escrow.connect(seller).list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"));
            await escrow.connect(buyer).depositEarnest(nftId, { value: ethers.parseEther("5") });

            await escrow.connect(inspector).updateInspectionStatus(nftId, true);
            await escrow.connect(buyer).approveSale(nftId);
            await escrow.connect(seller).approveSale(nftId);
            await escrow.connect(lender).approveSale(nftId);

            const tx = {
                to: await escrow.getAddress(),
                value: ethers.parseEther("10")
            };
            const transaction = await buyer.sendTransaction(tx);


        });
        it("Should not be listed", async function () {
            console.log(`Contract balance is: ${await escrow.getBalance()}`);
            await escrow.finalizeSale(nftId);
            assert.isFalse(await escrow.s_isListed(nftId));

        });
        it("Should change owner", async function () {
            const ownerBefore = await realEstate.ownerOf(nftId);
            console.log(`owner before: ${ownerBefore}`)
            await escrow.finalizeSale(nftId);
            const ownerAfter = await realEstate.ownerOf(nftId);

            console.log(`owner after: ${ownerAfter}`);
            assert.equal(ownerAfter, buyer.address)

        })
       
    });
    describe("cancelSale", async function () {
        let nftId: bigint;
        beforeEach(async function () {
            const txResponse = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
            const filter = realEstate.filters.Minted;
            const events = await realEstate.queryFilter(filter, -1);
            nftId = events[0].args[1];
            await realEstate.connect(seller).approve(await escrow.getAddress(), nftId);
            await escrow.connect(seller).list(nftId, buyer, ethers.parseEther("10"), ethers.parseEther("5"));
            await escrow.connect(buyer).depositEarnest(nftId, { value: ethers.parseEther("5") });

        })
        it("Should return earnest to buyer", async function () {
            const amountBefore= await ethers.provider.getBalance(buyer.address);
            await escrow.cancelSale(nftId);
            const amountAfter = await ethers.provider.getBalance(buyer.address);

            const comparison= amountAfter> amountBefore;

            assert.isTrue(comparison);

        })
        it("Should return earnest to seller", async function () {
            await escrow.connect(inspector).updateInspectionStatus(nftId, true);
            const amountBefore = await ethers.provider.getBalance(seller.address);
            await escrow.cancelSale(nftId);
            const amountAfter = await ethers.provider.getBalance(seller.address);

            const comparison = amountAfter > amountBefore;

            assert.isTrue(comparison);

        })

    });
});