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


const getFarmInfos = async (ninjaChefAddress) => {

    const ninjaChefFactory = await ethers.getContractFactory("NinjaChef");
    const ninjaChef = await ninjaChefFactory.attach(ninjaChefAddress);

    for (let i = 0; i < 10; i++) {
        const getFarm =  await ninjaChef.poolInfo(i);
        console.log("POOL INFO", i ,getFarm);
    }


};



const main = async () => {

    console.log("\n\n 📡 Getting farm infos...\n");
    await getFarmInfos("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
