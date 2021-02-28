const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Test jalapeno presale", function () {
    let jalapenoTokenInstance;
    let accounts;
    let provider;
    let account0;
    let account1;
    let account2;

    const amount = (n) => {
        return ethers.utils.parseEther(n)
    }

    const getBlockNumber = async (provider) => {
        return await provider.getBlockNumber();
    }

    const expectBalance = async (expectedBalance, address, contract) => {
        const balance = await contract.balanceOf(address);
        expect(expectedBalance).to.equal(balance);
    }

    const getBlockTimestamp = async (provider) => {
        return (await provider.getBlock()).timestamp;
    }

    before(async function () {
        accounts = await ethers.getSigners();
        account0 = accounts[0];
        account1 = accounts[1];
        account2 = accounts[2];
    })


    describe("Presale", function () {
        it("Should deploy JalapenoPresale", async function () {
            const JalapenoPresale = await ethers.getContractFactory("JalapenoPresale");

            const JalapenoToken = await ethers.getContractFactory("JalapenoToken");


            myContract = await YourContract.deploy();
        });

        describe("setPurpose()", function () {
            it("Should be able to set a new purpose", async function () {
                const newPurpose = "Test Purpose";

                await myContract.setPurpose(newPurpose);
                expect(await myContract.purpose()).to.equal(newPurpose);
            });
        });
    });
});
