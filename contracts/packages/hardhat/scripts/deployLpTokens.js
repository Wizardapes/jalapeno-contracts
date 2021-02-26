/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");


const main = async () => {

    console.log("\n\n 📡 Deploying LP Mocks...\n");

    const hunderedUnits = utils.parseEther("100");

    const BFI_JLP = await deploy("MockBEP20", ["BFI/JLP LP token", "BFI/JLP", hunderedUnits])
    const BFI_BZB = await deploy("MockBEP20", ["BFI/BZB LP token", "BFI/BZB", hunderedUnits])
    const BFI_UXB = await deploy("MockBEP20", ["BFI/UXB LP token", "BFI/UXB", hunderedUnits])
    const BFI_BNB = await deploy("MockBEP20", ["BFI/BNB LP token", "BFI/BNB", hunderedUnits])
    const BFI_BUSD = await deploy("MockBEP20", ["BFI/BUSD LP token", "BFI/BUSD", hunderedUnits])


    console.log(
        " 💾  Artifacts (address, abi, and args) saved to: ",
        chalk.blue("packages/hardhat/artifacts/"),
        "\n\n"
    );
};

const deploy = async (contractName, _args = [], overrides = {}, libraries = {}) => {
    console.log(` 🛰  Deploying: ${contractName}`);

    const contractArgs = _args || [];
    const contractArtifacts = await ethers.getContractFactory(contractName,{libraries: libraries});
    const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
    const encoded = abiEncodeArgs(deployed, contractArgs);
    fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

    let extraGasInfo = ""
    if(deployed&&deployed.deployTransaction){
        const gasUsed = deployed.deployTransaction.gasLimit.mul(deployed.deployTransaction.gasPrice)
        extraGasInfo = "("+utils.formatEther(gasUsed)+" ETH)"
    }

    console.log(
        " 📄",
        chalk.cyan(contractName),
        "deployed to:",
        chalk.magenta(deployed.address),
        chalk.grey(extraGasInfo)
    );

    if (!encoded || encoded.length <= 2) return deployed;
    fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));

    return deployed;
};


// ------ utils -------

// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan
const abiEncodeArgs = (deployed, contractArgs) => {
    // not writing abi encoded args if this does not pass
    if (
        !contractArgs ||
        !deployed ||
        !R.hasPath(["interface", "deploy"], deployed)
    ) {
        return "";
    }
    const encoded = utils.defaultAbiCoder.encode(
        deployed.interface.deploy.inputs,
        contractArgs
    );
    return encoded;
};

// checks if it is a Solidity file
const isSolidity = (fileName) =>
    fileName.indexOf(".sol") >= 0 && fileName.indexOf(".swp") < 0 && fileName.indexOf(".swap") < 0;

const readArgsFile = (contractName) => {
    let args = [];
    try {
        const argsFile = `./contracts/${contractName}.args`;
        if (!fs.existsSync(argsFile)) return args;
        args = JSON.parse(fs.readFileSync(argsFile));
    } catch (e) {
        console.log(e);
    }
    return args;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
