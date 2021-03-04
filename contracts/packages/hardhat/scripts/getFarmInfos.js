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

    const poolLength = (await ninjaChef.poolLength()).toNumber();

    for (let i = 0; i < poolLength; i++) {
        const getFarm =  await ninjaChef.poolInfo(i);
        console.log("POOL INFO", i ,getFarm);
    }


};



const main = async () => {

    console.log("\n\n 📡 Getting farm infos...\n");
    await getFarmInfos("0x66270210e291B22849b57ef3C443068fF3Df442c")
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
