import { ethers } from "hardhat";
const WTON_ABI = require("../abis/WTON.json");

async function depositWTON() {
  const [wtonHave] = await ethers.getSigners()

  let wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"
  let BridgeSwapAddress = ""

  let WTONamount1 = ethers.utils.parseUnits("1", 27);

  let wtonContract = new ethers.Contract(wtonAddress, WTON_ABI.abi, wtonHave );

  let l2Gas = 200000

  const approveData = ethers.utils.solidityPack(
    ["uint32"],
    [l2Gas]
  )
  
  await wtonContract.connect(wtonHave).approveAndCall(
    BridgeSwapAddress,
    WTONamount1,
    approveData
  )
  console.log("depositWTON finish");
}

async function depositWTONTo() {
  const [wtonHave] = await ethers.getSigners()

  let wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"
  let BridgeSwapAddress = ""

  let WTONamount1 = ethers.utils.parseUnits("1", 27);

  let wtonContract = new ethers.Contract(wtonAddress, WTON_ABI.abi, wtonHave);

  let l2Gas = 200000

  let getAddress = ""
  
  let data = "0x"

  const approveData = ethers.utils.solidityPack(
    ["uint32","address","bytes"],
    [l2Gas,getAddress,data]
  )
  
  await wtonContract.connect(wtonHave).approveAndCall(
    BridgeSwapAddress,
    WTONamount1,
    approveData
  )

  console.log("depositWTONTo finish");
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
