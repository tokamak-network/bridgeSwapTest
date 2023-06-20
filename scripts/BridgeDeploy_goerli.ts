import { ethers } from "hardhat";
const WTON_ABI = require("../abis/WTON.json");

let BridgeSwapContract: any

//goerli
let tonAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00";
let wtonAddress = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6"
let L2TONAddress = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
let l1BridgeAddress = "0x7377F3D0F64d7a54Cf367193eb74a052ff8578FD"
let wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"


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
