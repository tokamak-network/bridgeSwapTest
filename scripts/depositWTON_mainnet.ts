import { ethers } from "hardhat";
const TON_ABI = require("../abis/TON.json");
const BRIDGE_ABI = require("../artifacts/contracts/BridgeSwap.sol/BridgeSwap.json");

let wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"
let BridgeSwapAddress = ""

let getAddress = "0x6E1c4a442E9B9ddA59382ee78058650F1723E0F6"

let WTONamount1 = ethers.utils.parseUnits("1", 27);

let l2Gas = 200000
let data = "0x"

function sleep(ms: any) {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
}

async function depositWTON() {
  const [tonHave] = await ethers.getSigners()
  let wtonContract = new ethers.Contract(wtonAddress, TON_ABI.abi, tonHave );
  let BridgeContract = new ethers.Contract(BridgeSwapAddress, BRIDGE_ABI.abi, tonHave );

  let beforeWTON = await wtonContract.balanceOf(tonHave.address);
  console.log("beforeWTON : ", beforeWTON);

  await wtonContract.connect(tonHave).approve(
    BridgeSwapAddress,
    WTONamount1
  )
  console.log("depositWTON approve");
  sleep(12000);

  await BridgeContract.connect(tonHave).depositTON(
    WTONamount1,
    l2Gas,
    data
  )
  console.log("depositTON finish");
  sleep(12000);

  let afterWTON = await wtonContract.balanceOf(tonHave.address);
  console.log("afterWTON : ", afterWTON);
}

async function depositWTONTo() {
  const [tonHave] = await ethers.getSigners()
  let wtonContract = new ethers.Contract(wtonAddress, TON_ABI.abi, tonHave);  
  let BridgeContract = new ethers.Contract(BridgeSwapAddress, BRIDGE_ABI.abi, tonHave );

  let beforeWTON = await wtonContract.balanceOf(tonHave.address);
  console.log("beforeWTON : ", beforeWTON);

  await wtonContract.connect(tonHave).approve(
    BridgeSwapAddress,
    WTONamount1
  )
  console.log("depositTON approve");
  sleep(12000);

  
  await BridgeContract.connect(tonHave).depositTONTo(
    getAddress,
    WTONamount1,
    l2Gas,
    data
  )
  console.log("depositTON finish");
  sleep(12000);

  let afterWTON = await wtonContract.balanceOf(tonHave.address);
  console.log("afterWTON : ", afterWTON);
}

const main = async () => {
  await depositWTON()
  await depositWTONTo()
  // await initialize()
}  // main

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
