import { ethers } from "hardhat";
const WTON_ABI = require("../abis/WTON.json");

let BridgeSwapContract: any

// mainnet
let tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5";
let wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"
let L2TONAddress = "" //random Address
let l1BridgeAddress = "0x59aa194798Ba87D26Ba6bEF80B85ec465F4bbcfD"
let wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

let wtonContract: any

async function deployContract() {

  const BridgeSwap = await ethers.getContractFactory("BridgeSwap");
  BridgeSwapContract = await BridgeSwap.deploy(
    tonAddress,
    wtonAddress,
    L2TONAddress,
    l1BridgeAddress,
    wethAddress
  );

  await BridgeSwapContract.deployed();
  console.log(BridgeSwapContract.address);
}

// async function initialize() {
//   await BridgeSwapContract.initialize(
//     tonAddress,
//     wtonAddress,
//     l1TokenAddress,
//     l2TokenAddress,
//     l1BridgeAddress
//   )
//   console.log("initialize success")
// }

const main = async () => {
  await deployContract()
  // await initialize()
}  // main

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
