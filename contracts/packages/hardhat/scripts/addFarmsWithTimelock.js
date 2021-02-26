/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");

const getBlockNumber = async (provider) => {
    return await provider.getBlockNumber();
}

const getEtaExample = async (provider) => {
    return (await provider.getBlock()).timestamp + 20;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const addFarmFromTimelock = async (timelockAddress, ninjaChefAddress, lpTokenAddress, allocPoints, depositFee, withUpdate, ETA) => {

    const ninjaChefFactory = await ethers.getContractFactory("NinjaChef");
    const ninjaChef = await ninjaChefFactory.attach(ninjaChefAddress);

    const timelockFactory = await ethers.getContractFactory("Timelock");
    const timelock = await timelockFactory.attach(timelockAddress);


    const addFarmSignature = ninjaChef.interface.getFunction('add').format();
    const addFarmData = ninjaChef.interface.encodeFunctionData("add", [allocPoints, lpTokenAddress, depositFee, withUpdate]);

    const deployerWallet = ethers.provider.getSigner();
    const deployerWalletAddress = await deployerWallet.getAddress();

    const farmQueuedRes = await timelock.queueTransaction(ninjaChef.address, 0, addFarmSignature, addFarmData, ETA, {from: deployerWalletAddress})
    console.log("Farm queued!", farmQueuedRes);

    ethers.provider.send("evm_increaseTime", [60])   // add 60 seconds
    const farmAddedResult = await timelock.executeTransaction(ninjaChef.address, 0, addFarmSignature, addFarmData, ETA, {from: deployerWalletAddress})
    console.log("Farm added!", farmAddedResult);

    const getFarm =  await ninjaChef.poolInfo(0);
    console.log("POOL INFO", getFarm);

};



const main = async () => {

    console.log("\n\n 📡 Adding farms...\n");
    const eta = await getEtaExample(ethers.provider)
    console.log("ETA", eta);
    await addFarmFromTimelock('0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 4000, 0, true, eta)
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
