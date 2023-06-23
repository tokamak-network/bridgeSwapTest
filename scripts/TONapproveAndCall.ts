import { ethers } from "hardhat";
const TON_ABI = require("../abis/TON.json");

let tonAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00"
let BridgeSwapAddress = "0xEB141C111a7fAf5fb494a5992dA5B1F36CA1C935"

let getAddress = "0xc1eba383D94c6021160042491A5dfaF1d82694E6"

let TONamount1 = ethers.utils.parseUnits("1", 18);

let l2Gas = 200000

async function depositTON() {
  const [tonHave] = await ethers.getSigners()
  let tonContract = new ethers.Contract(tonAddress, TON_ABI.abi, tonHave );

  const approveData = ethers.utils.solidityPack(
    ["uint32"],
    [l2Gas]
  )
  
  await tonContract.connect(tonHave).approveAndCall(
    BridgeSwapAddress,
    TONamount1,
    approveData
  )
  console.log("depositTON finish");
}

async function depositTONTo() {
  const [tonHave] = await ethers.getSigners()

  let tonContract = new ethers.Contract(tonAddress, TON_ABI.abi, tonHave);  
  let data = "0x"

  const approveData = ethers.utils.solidityPack(
    ["uint32","address","bytes"],
    [l2Gas,getAddress,data]
  )
  
  await tonContract.connect(tonHave).approveAndCall(
    BridgeSwapAddress,
    TONamount1,
    approveData
  )

  console.log("depositTONTo finish");
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
