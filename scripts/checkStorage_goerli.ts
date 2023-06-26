import { ethers } from "hardhat";
import { expect } from "chai";
const TON_ABI = require("../abis/TON.json");
const BRIDGE_ABI = require("../artifacts/contracts/BridgeSwap.sol/BridgeSwap.json");

let tonAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00"
let wtonAddress = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6"
let l2TONAddress = "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa"
let l1standardBridge = "0x7377F3D0F64d7a54Cf367193eb74a052ff8578FD"
let wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"

let BridgeSwapAddress = "0xEB141C111a7fAf5fb494a5992dA5B1F36CA1C935"

async function checkAddress() {
  const [tonHave] = await ethers.getSigners()
  let BridgeContract = new ethers.Contract(BridgeSwapAddress, BRIDGE_ABI.abi, tonHave );

  
  let tonStorage = await BridgeContract.connect(tonHave).ton()
  console.log("tonStorage : ", tonStorage)
  expect(tonStorage).to.be.equal(tonAddress)

  let wtonStorage = await BridgeContract.connect(tonHave).wton()
  console.log("wtonStorage : ", wtonStorage)
  expect(wtonStorage).to.be.equal(wtonAddress)

  let l2tonStorage = await BridgeContract.connect(tonHave).l2Token()
  console.log("l2tonStorage : ", l2tonStorage)
  expect(l2tonStorage).to.be.equal(l2TONAddress)

  let l1bridgeStorage = await BridgeContract.connect(tonHave).l1Bridge()
  console.log("l1bridgeStorage : ", l1bridgeStorage)
  expect(l1bridgeStorage).to.be.equal(l1standardBridge)
  
  let wethStorage = await BridgeContract.connect(tonHave).weth()
  console.log("wethStorage : ", wethStorage)
  expect(wethStorage).to.be.equal(wethAddress)


  console.log("checkAddress finish");
}

const main = async () => {
  await checkAddress()
}  // main

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
