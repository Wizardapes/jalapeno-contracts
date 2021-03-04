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

    const deployerWallet = ethers.provider.getSigner();
    const deployerWalletAddress = await deployerWallet.getAddress();

    const res = await ninjaChef.add(allocPoints, lpTokenAddress, depositFee, withUpdate, {from: deployerWalletAddress})
};



const main = async () => {

    console.log("\n\n 📡 Adding farms...\n");


    const NINJA_CHEF_ADDRESS = "0x66270210e291B22849b57ef3C443068fF3Df442c"
    const JLP_TOKEN_ADDRESS = "0x0f64828E59eA5dD54E497Cf266ae281a5B4432Ea"

    const BFI_TOKEN_ADDRESS = "0x59aB5a04E76baD3d0f7b8DAbE59ea9a68D26855a"
    const BUSD_TOKEN_ADDRESS = "0xEe67fAB6b75B19CEDA3bD3aA601F57F73a825eef"
    const DAI_TOKEN_ADDRESS = "0xd77bAbaB31fdD00DAD4B71C9bc06ff754Ea5Ef17"
    const BNB_TOKEN_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd" // WBNB
    const BZB_TOKEN_ADDRESS = "0x87f3422b0930844422F71Fd8347dC6dBBd57fde6"

    const BFI_JLP_LP_TOKEN_ADDRESS = "0x3dC198BD286db40C518b6c9c7f7C4D716d01349f"
    const BFI_BZB_LP_TOKEN_ADDRESS = "0x1aA8DBa85814310bE122c74Bd073267af71096DE"
    const BFI_BNB_LP_TOKEN_ADDRESS = "0xF6C3bd81C274E6Ce518766Dc2E1eCD739659099b"
    const BFI_BUSD_LP_TOKEN_ADDRESS = "0xa02Db7B91D05fdB6D36A5b429f90760AB810A473"

    const JLP_BUSD_LP_TOKEN_ADDRESS = "0x0Cada859572139F354EFd16344Fb42D33367c002"
    const JLP_BNB_LP_TOKEN_ADDRESS = "0x2dE56c55F84F7DAaF38D863f722e584c854EFCeA"

    const BNB_BUSD_LP_TOKEN_ADDRESS = "0x7B60dd4a23126C9e3aFfe0a9FB0e95D276A919DB"
    const DAI_BUSD_LP_TOKEN_ADDRESS = "0x8Cb44d2E0C00e702DACdB16251Dd9b31222fC0A6"

    const NO_DEPOSIT_FEE = 0
    const DEPOSIT_FEE_1_PERCENT = 100
    const DEPOSIT_FEE_3_PERCENT = 300
    const x1_coeff = 100
    const x2_coeff = 200
    const x3_coeff = 300
    const x5_coeff = 500
    const x10_coeff = 1000
    const x20_coeff = 2000
    const x25_coeff = 2500
    const x30_coeff = 3000


    // BFI Farms
    // await addFarm( NINJA_CHEF_ADDRESS, BFI_JLP_LP_TOKEN_ADDRESS, x25_coeff, NO_DEPOSIT_FEE, true)
    // await addFarm( NINJA_CHEF_ADDRESS, BFI_BZB_LP_TOKEN_ADDRESS, x5_coeff, DEPOSIT_FEE_1_PERCENT, true)
    // await addFarm( NINJA_CHEF_ADDRESS, BFI_BNB_LP_TOKEN_ADDRESS, x5_coeff, DEPOSIT_FEE_1_PERCENT, true)
    //
    // // JLP Farms
    // await addFarm( NINJA_CHEF_ADDRESS, JLP_BUSD_LP_TOKEN_ADDRESS, x20_coeff, NO_DEPOSIT_FEE, true)
    // await addFarm( NINJA_CHEF_ADDRESS, JLP_BNB_LP_TOKEN_ADDRESS, x20_coeff, NO_DEPOSIT_FEE, true)
    //
    // // Pools
    // await addFarm( NINJA_CHEF_ADDRESS, JLP_TOKEN_ADDRESS, x20_coeff, NO_DEPOSIT_FEE, true)
    // await addFarm( NINJA_CHEF_ADDRESS, BFI_TOKEN_ADDRESS, x5_coeff, NO_DEPOSIT_FEE, true)
    // await addFarm( NINJA_CHEF_ADDRESS, BUSD_TOKEN_ADDRESS, x1_coeff, DEPOSIT_FEE_3_PERCENT, true)
    // await addFarm( NINJA_CHEF_ADDRESS, DAI_TOKEN_ADDRESS, x1_coeff, DEPOSIT_FEE_3_PERCENT, true)
    await addFarm( NINJA_CHEF_ADDRESS, BNB_TOKEN_ADDRESS, x1_coeff, DEPOSIT_FEE_3_PERCENT, true)
    //

};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
