import { ethers } from "hardhat";
const TON_ABI = require("../abis/TON.json");
const BRIDGE_ABI = require("../artifacts/contracts/BridgeSwap.sol/BridgeSwap.json");

let tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5"
let BridgeSwapAddress = ""

let getAddress = "0x6E1c4a442E9B9ddA59382ee78058650F1723E0F6"

let TONamount1 = ethers.utils.parseUnits("1", 18);

let l2Gas = 200000
let data = "0x"

function sleep(ms: any) {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
}

async function depositTON() {
  const [tonHave] = await ethers.getSigners()
  let tonContract = new ethers.Contract(tonAddress, TON_ABI.abi, tonHave );
  let BridgeContract = new ethers.Contract(BridgeSwapAddress, BRIDGE_ABI.abi, tonHave );

  let beforeTON = await tonContract.balanceOf(tonHave.address);
  console.log("beforeTON : ", beforeTON);

  await tonContract.connect(tonHave).approve(
    BridgeSwapAddress,
    TONamount1
  )
  console.log("depositTON approve");
  sleep(12000);

  await BridgeContract.connect(tonHave).depositTON(
    TONamount1,
    l2Gas,
    data
  )
  console.log("depositTON finish");
  sleep(12000);

  let afterTON = await tonContract.balanceOf(tonHave.address);
  console.log("afterTON : ", afterTON);
}

async function depositTONTo() {
  const [tonHave] = await ethers.getSigners()
  let tonContract = new ethers.Contract(tonAddress, TON_ABI.abi, tonHave);  
  let BridgeContract = new ethers.Contract(BridgeSwapAddress, BRIDGE_ABI.abi, tonHave );

  let beforeTON = await tonContract.balanceOf(tonHave.address);
  console.log("beforeTON : ", beforeTON);

  await tonContract.connect(tonHave).approve(
    BridgeSwapAddress,
    TONamount1
  )
  console.log("depositTON approve");
  sleep(12000);

  
  await BridgeContract.connect(tonHave).depositTONTo(
    getAddress,
    TONamount1,
    l2Gas,
    data
  )
  console.log("depositTON finish");
  sleep(12000);

  let afterTON = await tonContract.balanceOf(tonHave.address);
  console.log("afterTON : ", afterTON);
}

const main = async () => {
  await depositTON()
  await depositTONTo()
  // await initialize()
}  // main

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
