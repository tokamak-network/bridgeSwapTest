import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HardhatUserConfig, task } from "hardhat/config";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-toolbox";

const WTON_ABI = require("../abis/WTON.json");

task("wtonApproveAndCall", "Call approveAndCall").setAction(async () => {
    const [wtonHave] = await ethers.getSigners()

    let wtonAddress = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6"
    let BridgeSwapAddress = "0xEB141C111a7fAf5fb494a5992dA5B1F36CA1C935"

    let WTONamount1 = ethers.utils.parseUnits("1", 27);

    let wtonContract = new ethers.Contract(wtonAddress, WTON_ABI.abi, wtonHave );

    let l2Gas = 200000

    const approveData = ethers.utils.solidityPack(
      ["uint32"],
      [l2Gas]
    )
    let beforeWTON = await wtonContract.balanceOf(wtonHave.address)
    console.log("beforeWTON : ", beforeWTON);
    await wtonContract.connect(wtonHave).approveAndCall(
      BridgeSwapAddress,
      WTONamount1,
      approveData
    )
    let afterWTON = await wtonContract.balanceOf(wtonHave.address)
    console.log("afterWTON : ", afterWTON);
    
  });