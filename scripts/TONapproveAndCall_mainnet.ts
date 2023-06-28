import { ethers } from "hardhat";
const TON_ABI = require("../abis/TON.json");

let tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5"
let BridgeSwapAddress = "0xA3139764F343f44A7809dA51DC3a34C3d94450d0"

let getAddress = "0x6E1c4a442E9B9ddA59382ee78058650F1723E0F6"

let TONamount1 = ethers.utils.parseUnits("1", 18);

let l2Gas = 200000

function sleep(ms: any) {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
}

async function depositTON() {
  const [tonHave] = await ethers.getSigners()
  let tonContract = new ethers.Contract(tonAddress, TON_ABI.abi, tonHave );

  const approveData = ethers.utils.solidityPack(
    ["uint32"],
    [l2Gas]
  )
  let tx = await tonContract.balanceOf(tonHave.address);
  console.log("beforeDepositTON : ", tx)
  await tonContract.connect(tonHave).approveAndCall(
    BridgeSwapAddress,
    TONamount1,
    approveData
  )
  console.log("depositTON finish");
  sleep(12000);

  let tx2 = await tonContract.balanceOf(tonHave.address);
  console.log("afterDepositTON : ", tx2)
}

async function depositTONTo() {
  const [tonHave] = await ethers.getSigners()

  let tonContract = new ethers.Contract(tonAddress, TON_ABI.abi, tonHave);  
  let data = "0x"

  const approveData = ethers.utils.solidityPack(
    ["uint32","address","bytes"],
    [l2Gas,getAddress,data]
  )

  let tx = await tonContract.balanceOf(tonHave.address);
  console.log("beforeDepositTONTo : ", tx)
  
  await tonContract.connect(tonHave).approveAndCall(
    BridgeSwapAddress,
    TONamount1,
    approveData
  )
  console.log("depositTONTo finish");
  sleep(12000);

  let tx2 = await tonContract.balanceOf(tonHave.address);
  console.log("afterDepositTON : ", tx2)

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
