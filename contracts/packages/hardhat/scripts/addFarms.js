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


const addFarm = async (ninjaChefAddress, lpTokenAddress, allocPoints, depositFee, withUpdate) => {

    const ninjaChefFactory = await ethers.getContractFactory("NinjaChef");
    const ninjaChef = await ninjaChefFactory.attach(ninjaChefAddress);

    await ninjaChef.add(allocPoints, lpTokenAddress, depositFee, withUpdate)
    const deployerWallet = ethers.provider.getSigner();
    const deployerWalletAddress = await deployerWallet.getAddress();

    const res = await ninjaChef.add(allocPoints, lpTokenAddress, depositFee, withUpdate, {from: deployerWalletAddress})
    console.log("Farm added!")

};



const main = async () => {

    console.log("\n\n 📡 Adding farms...\n");

    // add BFI/JLP
    // add BFI/BZB
    // add BFI/UXB
    // add BFI/BNB
    // add BFI/BUSD

    const NINJA_CHEF_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    const JLP_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

    const BFI_JLP_LP_TOKEN_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    const BFI_BZB_LP_TOKEN_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
    const BFI_UXB_LP_TOKEN_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
    const BFI_BNB_LP_TOKEN_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F"
    const BFI_BUSD_LP_TOKEN_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"


    await addFarm( NINJA_CHEF_ADDRESS, BFI_JLP_LP_TOKEN_ADDRESS, 4000, 0, true)
    await addFarm( NINJA_CHEF_ADDRESS, BFI_BZB_LP_TOKEN_ADDRESS, 4000, 0, true)
    await addFarm( NINJA_CHEF_ADDRESS, BFI_UXB_LP_TOKEN_ADDRESS, 4000, 0, true)
    await addFarm( NINJA_CHEF_ADDRESS, BFI_BNB_LP_TOKEN_ADDRESS, 4000, 0, true)
    await addFarm( NINJA_CHEF_ADDRESS, BFI_BUSD_LP_TOKEN_ADDRESS, 4000, 0, true)

};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
