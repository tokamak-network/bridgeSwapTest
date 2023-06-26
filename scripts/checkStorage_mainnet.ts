import { ethers } from "hardhat";
import { expect } from "chai";
const TON_ABI = require("../abis/TON.json");
const BRIDGE_ABI = require("../artifacts/contracts/BridgeSwap.sol/BridgeSwap.json");

let tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5"
let wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"
let l2TONAddress = ""
let l1standardBridge = "0x59aa194798Ba87D26Ba6bEF80B85ec465F4bbcfD"
let wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

let BridgeSwapAddress = ""

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
