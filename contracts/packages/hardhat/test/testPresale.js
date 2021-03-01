const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Test jalapeno presale", function () {
    let jalapenoTokenInstance;
    let jalapenoPresaleInstance;
    let accounts;
    let account0;
    let account1;
    let account2;
    let account3;
    let account4;
    let account5;
    let account6;
    let account7;
    let account8;
    let account9;
    let account10;
    const jlpPerBnb = 1000;

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
        account3 = accounts[3];
        account4 = accounts[4];
        account5 = accounts[5];
        account6 = accounts[6];
        account7 = accounts[7];
        account8 = accounts[8];
        account9 = accounts[9];
        account10 = accounts[10];
    })

    beforeEach(async function () {
        const jalapenoPresaleFactory = await ethers.getContractFactory("JalapenoPresale");
        const jalapenoTokenFactory = await ethers.getContractFactory("JalapenoToken");


        jalapenoTokenInstance = await jalapenoTokenFactory.deploy();
        await jalapenoTokenInstance.deployed();


        jalapenoPresaleInstance = await jalapenoPresaleFactory.deploy(jalapenoTokenInstance.address, jlpPerBnb);
        await jalapenoPresaleInstance.deployed();

        await jalapenoTokenInstance.transfer(jalapenoPresaleInstance.address, amount('100000'), {from: account0.address})

    })



    describe("JalapenoPresale", function () {
        it("Contract should be deployed correctly", async function () {
            const jalapenoAddress = await jalapenoPresaleInstance.jalapenoToken();

            // ADDRESSES
            expect (jalapenoAddress).to.be.properAddress;
            expect (jalapenoAddress).to.equal(jalapenoTokenInstance.address)


            // PUBLIC DATA
            let presaleStartTime = (await jalapenoPresaleInstance.PRESALE_START_TIME()).toNumber();
            let presaleEndTime = (await jalapenoPresaleInstance.PRESALE_END_TIME()).toNumber();
            let minContribution = (await jalapenoPresaleInstance.MIN_CONTRIBUTION())
            let maxContribution = (await jalapenoPresaleInstance.MAX_CONTRIBUTION())
            let presaleCap = (await jalapenoPresaleInstance.PRESALE_CAP())
            let bnbRaised = (await jalapenoPresaleInstance.bnbRaised())
            let jalapenosSold = (await jalapenoPresaleInstance.jalapenosSold())
            let jalapenosPerBnb = (await jalapenoPresaleInstance.jalapenosPerBnb())

            let isOpen = (await jalapenoPresaleInstance.isOpen())
            let areTokensClaimable = (await jalapenoPresaleInstance.areTokensClaimable())

            let jalapenosPresaleAmount = (await jalapenoTokenInstance.balanceOf(jalapenoPresaleInstance.address))


            expect (presaleStartTime).to.be.equal(1614632400);
            expect (presaleEndTime).to.be.equal(1614715200);
            expect (minContribution).to.be.equal(amount('1'));
            expect (maxContribution).to.be.equal(amount('15'));
            expect (presaleCap).to.be.equal(amount('100000'));

            expect (bnbRaised).to.be.equal(amount('0'));
            expect (jalapenosSold).to.be.equal(amount('0'));
            expect (jalapenosPerBnb).to.be.equal(1000);

            expect (isOpen).to.be.equal(false);
            expect (areTokensClaimable).to.be.equal(false);

            expect (jalapenosPresaleAmount).to.be.equal(amount('100000'));


        });

    });

    describe("JalapenoPresale tests", function () {
        it("Purchase should be reverted when the presale is not started", async function () {

            // Presale not started
            await expect(jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('10')})).to.be.revertedWith("JalapenoPresale: the presale is not open.");

        });

        it("Purchase should be reverted when the staking amount is not correct", async function () {

            // Presale not started
            await expect(jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('10')})).to.be.revertedWith("JalapenoPresale: the presale is not open.");

            // Open presale
            ethers.provider.send("evm_increaseTime", [60 * 60 * 10])   // add 10 hours in seconds
            ethers.provider.send("evm_mine")      // mine the next block

            let isOpen = (await jalapenoPresaleInstance.isOpen())
            expect (isOpen).to.be.equal(true);

            // Lower than MIN contribution
            await expect(jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('0.9')})).to.be.revertedWith("JalapenoPresale: minimum contribution is 1 BNB.");

            // Greater than MAX contribution
            await expect(jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('15.1')})).to.be.revertedWith("JalapenoPresale: You cannot buy more than 15 BNB worth of tokens.");



        });

        it("Purchase should be made when the parameters are correct", async function () {

            // purchase should be successful
            await jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('10')});

            let bnbRaised = (await jalapenoPresaleInstance.bnbRaised())
            let jalapenosSold = (await jalapenoPresaleInstance.jalapenosSold())
            let bnbContributed = (await jalapenoPresaleInstance.getBNBContributedAmount(account0.address))
            let claimableJalapenos = (await jalapenoPresaleInstance.getClaimableJalapenosAmount(account0.address))

            let areTokensClaimable = (await jalapenoPresaleInstance.areTokensClaimable())

            expect (bnbRaised).to.be.equal(amount('10'));
            expect (jalapenosSold).to.be.equal(amount('10').mul(jlpPerBnb));
            expect (bnbContributed).to.be.equal(amount('10'));
            expect (claimableJalapenos).to.be.equal(amount('10').mul(jlpPerBnb));

            let presaleBalance = await jalapenoTokenInstance.balanceOf(jalapenoPresaleInstance.address);
            expect (presaleBalance).to.be.equal(amount('100000'));
            expect (areTokensClaimable).to.be.equal(false);


        });

        it("Multiple purchases from the same account should be possible", async function () {

            // purchase should be successful
            await jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('10')});
            await jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('5')});
            ethers.provider.send("evm_mine")      // mine the next block

            let bnbRaised = (await jalapenoPresaleInstance.bnbRaised())
            let jalapenosSold = (await jalapenoPresaleInstance.jalapenosSold())
            let bnbContributed = (await jalapenoPresaleInstance.getBNBContributedAmount(account0.address))
            let claimableJalapenos = (await jalapenoPresaleInstance.getClaimableJalapenosAmount(account0.address))
            // ethers.provider.send("evm_mine")      // mine the next block

            expect (bnbRaised).to.be.equal(amount('15'));
            expect (jalapenosSold).to.be.equal(amount('15').mul(jlpPerBnb));
            expect (bnbContributed).to.be.equal(amount('15'));
            expect (claimableJalapenos).to.be.equal(amount('15').mul(jlpPerBnb));

            let presaleBalance = await jalapenoTokenInstance.balanceOf(jalapenoPresaleInstance.address);
            expect (presaleBalance).to.be.equal(amount('100000'));


        });

        it("Purchase should not be made when the maximum contribution amount per wallet is reached", async function () {

            // purchase should be successful
            await expect(jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('1')}));
            await expect(jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('15')})).to.be.revertedWith("JalapenoPresale: You cannot buy more than 15 BNB worth of tokens.");

            let bnbContributed = (await jalapenoPresaleInstance.getBNBContributedAmount(account0.address))
            let claimableJalapenos = (await jalapenoPresaleInstance.getClaimableJalapenosAmount(account0.address))

            expect (bnbContributed).to.be.equal(amount('1'));
            expect (claimableJalapenos).to.be.equal(amount('1').mul(jlpPerBnb));


        });

        it("Purchase should not be made when max amount is reached", async function () {

            const jalapenoPresaleInstance1 = jalapenoPresaleInstance.connect(account1)
            const jalapenoPresaleInstance2 = jalapenoPresaleInstance.connect(account2)
            const jalapenoPresaleInstance3 = jalapenoPresaleInstance.connect(account3)
            const jalapenoPresaleInstance4 = jalapenoPresaleInstance.connect(account4)
            const jalapenoPresaleInstance5 = jalapenoPresaleInstance.connect(account5)
            const jalapenoPresaleInstance6 = jalapenoPresaleInstance.connect(account6)
            const jalapenoPresaleInstance7 = jalapenoPresaleInstance.connect(account7)
            const jalapenoPresaleInstance8 = jalapenoPresaleInstance.connect(account8)
            const jalapenoPresaleInstance9 = jalapenoPresaleInstance.connect(account9)
            const jalapenoPresaleInstance10 = jalapenoPresaleInstance.connect(account10)
            // purchase should be successful
            await expect(jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance1.purchaseTokens({from: account1.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance2.purchaseTokens({from: account2.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance3.purchaseTokens({from: account3.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance4.purchaseTokens({from: account4.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance5.purchaseTokens({from: account5.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance6.purchaseTokens({from: account6.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance7.purchaseTokens({from: account7.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance8.purchaseTokens({from: account8.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance9.purchaseTokens({from: account9.address, value: amount('10')}));


            let bnbRaised = (await jalapenoPresaleInstance9.bnbRaised())
            expect (bnbRaised).to.be.equal(amount('100'));

            await expect(jalapenoPresaleInstance10.purchaseTokens({from: account10.address, value: amount('10')})).to.be.revertedWith("JalapenoPresale: the presale amount is reached.");

        });

        it("Purchase should finish correctly", async function () {

            const jalapenoPresaleInstance1 = jalapenoPresaleInstance.connect(account1)
            const jalapenoPresaleInstance2 = jalapenoPresaleInstance.connect(account2)
            const jalapenoPresaleInstance3 = jalapenoPresaleInstance.connect(account3)
            const jalapenoPresaleInstance4 = jalapenoPresaleInstance.connect(account4)
            const jalapenoPresaleInstance5 = jalapenoPresaleInstance.connect(account5)
            const jalapenoPresaleInstance6 = jalapenoPresaleInstance.connect(account6)
            const jalapenoPresaleInstance7 = jalapenoPresaleInstance.connect(account7)
            const jalapenoPresaleInstance8 = jalapenoPresaleInstance.connect(account8)
            const jalapenoPresaleInstance9 = jalapenoPresaleInstance.connect(account9)
            const jalapenoPresaleInstance10 = jalapenoPresaleInstance.connect(account10)
            // purchase should be successful
            await expect(jalapenoPresaleInstance.purchaseTokens({from: account0.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance1.purchaseTokens({from: account1.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance2.purchaseTokens({from: account2.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance3.purchaseTokens({from: account3.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance4.purchaseTokens({from: account4.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance5.purchaseTokens({from: account5.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance6.purchaseTokens({from: account6.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance7.purchaseTokens({from: account7.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance8.purchaseTokens({from: account8.address, value: amount('10')}));
            await expect(jalapenoPresaleInstance9.purchaseTokens({from: account9.address, value: amount('10')}));


            let bnbRaised = (await jalapenoPresaleInstance9.bnbRaised())
            expect (bnbRaised).to.be.equal(amount('100'));

            let jalapenosSold = (await jalapenoPresaleInstance9.jalapenosSold())
            expect (jalapenosSold).to.be.equal(amount('100000'));

            let bnbContributed = (await jalapenoPresaleInstance.getBNBContributedAmount(account0.address))
            let claimableJalapenos = (await jalapenoPresaleInstance.getClaimableJalapenosAmount(account0.address))

            expect (bnbContributed).to.be.equal(amount('10'));
            expect (claimableJalapenos).to.be.equal(amount('10').mul(jlpPerBnb));

            let areTokensClaimable = (await jalapenoPresaleInstance.areTokensClaimable())
            expect (areTokensClaimable).to.be.equal(false);

            let presaleBalance = await jalapenoTokenInstance.balanceOf(jalapenoPresaleInstance.address);
            expect (presaleBalance).to.be.equal(amount('100000'));

            await expect(jalapenoPresaleInstance1.claimTokens({from: account1.address})).to.be.revertedWith("JalapenoPresale: The tokens are not claimable yet.");


            await jalapenoPresaleInstance.enableTokenRetrieval();

            areTokensClaimable = (await jalapenoPresaleInstance.areTokensClaimable())
            expect (areTokensClaimable).to.be.equal(true);

            await jalapenoPresaleInstance1.claimTokens({from: account1.address});
            const jlpBalanceOf = await jalapenoTokenInstance.balanceOf(account1.address);
            console.log(jlpBalanceOf.toString())
            expect (jlpBalanceOf).to.be.equal(amount('10000'));


            const balance = (await ethers.provider.getBalance(jalapenoPresaleInstance9.address)).toString();
            console.log("BALANCE", balance);

            const balance1 = (await ethers.provider.getBalance(account0.address));
            console.log("BALANCE1", balance1.toString());
            await jalapenoPresaleInstance.takeOutFundingRaised({from: account0.address});
            //
            const balance2 = (await ethers.provider.getBalance(account0.address));
            // expect (balance2).to.be.equal(balance1.plus(amount('100')));
            console.log("BALANCE2", balance2.toString());
            console.log("BALANCE3", (balance2.add(balance1).toString()));






        });





    });
});
