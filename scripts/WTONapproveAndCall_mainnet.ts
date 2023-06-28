import { ethers } from "hardhat";
const WTON_ABI = require("../abis/WTON.json");

function sleep(ms: any) {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
}

async function depositWTON() {
  const [wtonHave] = await ethers.getSigners()

  let wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"
  let BridgeSwapAddress = "0xA3139764F343f44A7809dA51DC3a34C3d94450d0"

  let WTONamount1 = ethers.utils.parseUnits("1", 27);

  let wtonContract = new ethers.Contract(wtonAddress, WTON_ABI.abi, wtonHave );

  let l2Gas = 200000

  const approveData = ethers.utils.solidityPack(
    ["uint32"],
    [l2Gas]
  )

  let tx = await wtonContract.balanceOf(wtonHave.address);
  console.log("beforeDepositWTON : ", tx)
  
  await wtonContract.connect(wtonHave).approveAndCall(
    BridgeSwapAddress,
    WTONamount1,
    approveData
  )

  sleep(12000);
  console.log("depositWTON finish");

  let tx2 = await wtonContract.balanceOf(wtonHave.address);
  console.log("afterDepositWTON : ", tx2)


}

async function depositWTONTo() {
  const [wtonHave] = await ethers.getSigners()

  let wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"
  let BridgeSwapAddress = "0xA3139764F343f44A7809dA51DC3a34C3d94450d0"

  let WTONamount1 = ethers.utils.parseUnits("1", 27);

  let wtonContract = new ethers.Contract(wtonAddress, WTON_ABI.abi, wtonHave);

  let l2Gas = 200000

  let getAddress = "0x6E1c4a442E9B9ddA59382ee78058650F1723E0F6"
  
  let data = "0x"

  const approveData = ethers.utils.solidityPack(
    ["uint32","address","bytes"],
    [l2Gas,getAddress,data]
  )
  let tx = await wtonContract.balanceOf(wtonHave.address);
  console.log("beforeDepositWTONTo : ", tx)

  await wtonContract.connect(wtonHave).approveAndCall(
    BridgeSwapAddress,
    WTONamount1,
    approveData
  )
  
  sleep(12000);
  console.log("depositWTONTo finish");
  
  let tx2 = await wtonContract.balanceOf(wtonHave.address);
  console.log("afterDepositWTONTo : ", tx2)

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
