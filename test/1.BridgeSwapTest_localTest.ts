import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

const WTON_ABI = require("../abis/WTON.json");
const TON_ABI = require("../abis/TON.json");

describe("BridgeSwapTest", function () {
  let wtonHaveAccount = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea";

  let testAccount : any

  let BridgeSwapContract: any

  let wtonContract: any
  let tonContract: any

  let tonAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00";

  let wtonAddress = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6"
  let l1TokenAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00"
  let l2TokenAddress = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
  let l1BridgeAddress = "0x7377F3D0F64d7a54Cf367193eb74a052ff8578FD"
  let l2Gas = 1300000
  let data = "0x"

  let depositAmount = ethers.utils.parseUnits("1", 18);
  let amount1 = ethers.utils.parseUnits("1", 27);
  let amount2 = ethers.utils.parseUnits("2", 27);

  before('account setting', async () => {
    testAccount = await ethers.getSigner(wtonHaveAccount)
    await ethers.provider.send("hardhat_impersonateAccount",[wtonHaveAccount]);
    await ethers.provider.send("hardhat_setBalance", [
      wtonHaveAccount,
      "0x8ac7230489e80000",
    ]);
  })

  describe("Deployment & initialize", function () {
    it("set wton", async () => {
      wtonContract = new ethers.Contract(wtonAddress, WTON_ABI.abi, testAccount );
    })

    it("set ton", async () => {
      tonContract = new ethers.Contract(tonAddress, TON_ABI.abi, testAccount );
    })

    it("Deploy the BridgeSwapTest", async function () {
      // We don't use the fixture here because we want a different deployment
      const BridgeSwap = await ethers.getContractFactory("BridgeSwap");
      BridgeSwapContract = await BridgeSwap.connect(testAccount).deploy();
    });

    it("initialize", async () => {
      await BridgeSwapContract.connect(testAccount).initialize(
        tonAddress,
        wtonAddress,
        l1TokenAddress,
        l2TokenAddress,
        l1BridgeAddress
      )
      expect(await BridgeSwapContract.wton()).to.be.equal(wtonAddress)
      expect(await BridgeSwapContract.l1Token()).to.be.equal(l1TokenAddress)
      expect(await BridgeSwapContract.l2Token()).to.be.equal(l2TokenAddress)
      expect(await BridgeSwapContract.l1Bridge()).to.be.equal(l1BridgeAddress)
    })
  });

  describe("swapAndDepositTest", () => {
    it("swapAndDeposit is fail before approve", async () => {
      await expect(
        BridgeSwapContract.connect(testAccount).swapAndDeposit(
          amount1,
          l2Gas,
          data
        )
      ).to.be.revertedWith("wton exceeds allowance"); 
    })

    it("swapAndDeposit is success after approve", async () => {
      let beforeWTON = await wtonContract.balanceOf(testAccount.address)
      console.log(beforeWTON)
      await wtonContract.connect(testAccount).approve(BridgeSwapContract.address, amount1);
      let allowanceAmount = await wtonContract.allowance(testAccount.address,BridgeSwapContract.address);
      console.log(allowanceAmount)
      console.log(depositAmount)
      await BridgeSwapContract.connect(testAccount).swapAndDeposit(
        depositAmount,
        l2Gas,
        data
      )
      let afterWTON = await wtonContract.balanceOf(testAccount.address)
      console.log(afterWTON)
      expect(beforeWTON).to.be.gt(afterWTON);
    })
  })

});
