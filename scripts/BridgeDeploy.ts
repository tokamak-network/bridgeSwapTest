import { ethers } from "hardhat";
const WTON_ABI = require("../abis/WTON.json");

let BridgeSwapContract: any

let tonAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00";
let wtonAddress = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6"
let l1TokenAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00"
let l2TokenAddress = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
let l1BridgeAddress = "0x7377F3D0F64d7a54Cf367193eb74a052ff8578FD"

let wtonContract: any

let wtonHaveAccount = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea";

async function deployContract() {

  const BridgeSwap = await ethers.getContractFactory("BridgeSwap");
  BridgeSwapContract = await BridgeSwap.deploy();

  await BridgeSwapContract.deployed();
  console.log(BridgeSwapContract.address);
}

async function initialize() {
  await BridgeSwapContract.initialize(
    tonAddress,
    wtonAddress,
    l1TokenAddress,
    l2TokenAddress,
    l1BridgeAddress
  )
  console.log("initialize success")
}

async function executeSwapAndDeposit() {
  wtonContract = new ethers.Contract(wtonAddress, WTON_ABI.abi, ethers.provider );
  let depostiAmount = ethers.utils.parseEther("1");
  let wtonAmount = ethers.utils.parseUnits("1", 27);
  let l2Gas = 1300000
  let data = "0x"


  let beforeWTON = await wtonContract.balanceOf(wtonHaveAccount)
  console.log(beforeWTON)
  await wtonContract.approve(BridgeSwapContract.address, wtonAmount);
  await BridgeSwapContract.swapAndDeposit(
    depostiAmount,
    l2Gas,
    data
  )

  let afterWTON = await wtonContract.balanceOf(wtonHaveAccount)
  console.log(afterWTON)
}

const main = async () => {
  await deployContract()
  await initialize()
  await executeSwapAndDeposit()
}  // main

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
