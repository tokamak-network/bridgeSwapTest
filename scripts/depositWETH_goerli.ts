import { ethers } from "hardhat";
const WETH_ABI = require("../abis/WETH.json");
const BRIDGE_ABI = require("../artifacts/contracts/BridgeSwap.sol/BridgeSwap.json");

let wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
let BridgeSwapAddress = "0xEB141C111a7fAf5fb494a5992dA5B1F36CA1C935"

let getAddress = "0xc1eba383D94c6021160042491A5dfaF1d82694E6"

let WETHamount1 = ethers.utils.parseUnits("1", 16);

let l2Gas = 200000
let data = "0x"

function sleep(ms: any) {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
}

async function depositWETH() {
  const [tonHave] = await ethers.getSigners()
  let wethContract = new ethers.Contract(wethAddress, WETH_ABI, tonHave );
  let BridgeContract = new ethers.Contract(BridgeSwapAddress, BRIDGE_ABI.abi, tonHave );

  let beforeWETH = await wethContract.balanceOf(tonHave.address);
  console.log("beforeWETH : ", beforeWETH);

  await wethContract.connect(tonHave).approve(
    BridgeSwapAddress,
    WETHamount1
  )
  console.log("depositWTON approve");
  sleep(12000);

  await BridgeContract.connect(tonHave).depositTON(
    WETHamount1,
    l2Gas,
    data
  )
  console.log("depositTON finish");
  sleep(12000);

  let afterWETH = await wethContract.balanceOf(tonHave.address);
  console.log("afterWETH : ", afterWETH);
}

async function depositWETHTo() {
  const [tonHave] = await ethers.getSigners()
  let wethContract = new ethers.Contract(wethAddress, WETH_ABI, tonHave);  
  let BridgeContract = new ethers.Contract(BridgeSwapAddress, BRIDGE_ABI.abi, tonHave );

  let beforeWETH = await wethContract.balanceOf(tonHave.address);
  console.log("beforeWETH : ", beforeWETH);

  await wethContract.connect(tonHave).approve(
    BridgeSwapAddress,
    WETHamount1
  )
  console.log("depositTON approve");
  sleep(12000);

  
  await BridgeContract.connect(tonHave).depositTONTo(
    getAddress,
    WETHamount1,
    l2Gas,
    data
  )
  console.log("depositTON finish");
  sleep(12000);

  let afterWETH = await wethContract.balanceOf(tonHave.address);
  console.log("afterWETH : ", afterWETH);
}

const main = async () => {
  await depositWETH()
  await depositWETHTo()
  // await initialize()
}  // main

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
