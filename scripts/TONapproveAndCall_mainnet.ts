import { ethers } from "hardhat";
const TON_ABI = require("../abis/TON.json");

let tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5"
let BridgeSwapAddress = ""

let getAddress = ""

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
