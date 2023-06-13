import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

const WTON_ABI = require("../abis/WTON.json");
const TON_ABI = require("../abis/TON.json");

const { padLeft } = require('web3-utils');

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
  let data = "0x00"
  let data2 = "0x00"
  let bytesData = "00"

  let depositAmount = ethers.utils.parseUnits("1", 18);
  let WTONamount1 = ethers.utils.parseUnits("1", 27);
  let WTONamount2 = ethers.utils.parseUnits("2", 27);
  let TONamount1 = ethers.utils.parseUnits("1", 18);
  let TONamount2 = ethers.utils.parseUnits("2", 18);

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
  });

  describe("BridgeSwapTest", () => {
    describe("#1. WTON Deposit Test", () => {
      it("#1-1. WTONDepoist is fail before approve", async () => {
        await expect(
          BridgeSwapContract.connect(testAccount).WTONDeposit(
            WTONamount1,
            l2Gas,
            data
          )
        ).to.be.revertedWith("wton exceeds allowance"); 
      })

      it("#1-2. WTONDeposit is success after approve", async () => {
        let beforeWTON = await wtonContract.balanceOf(testAccount.address)
        // console.log(beforeWTON)
        await wtonContract.connect(testAccount).approve(BridgeSwapContract.address, WTONamount1);
        let allowanceAmount = await wtonContract.allowance(testAccount.address,BridgeSwapContract.address);
        // console.log(allowanceAmount)
        // console.log(WTONamount1)
        expect(allowanceAmount).to.be.equal(WTONamount1);
        await BridgeSwapContract.connect(testAccount).WTONDeposit(
          WTONamount1,
          l2Gas,
          data
        )
        let afterWTON = await wtonContract.balanceOf(testAccount.address)
        // console.log(afterWTON)
        expect(beforeWTON).to.be.gt(afterWTON);
      })

      it("#1-3. WTON approveAndCall Test", async () => {
        const approveData = ethers.utils.solidityPack(
          ["uint32","bytes"],
          [l2Gas,data]
        )
        console.log("approveData :", approveData);
        await wtonContract.connect(testAccount).approveAndCall(
          BridgeSwapContract.address,
          WTONamount1,
          approveData
        )
      })

      it("#1-4. WTON approveAndCall calldata Test", async () => {
        const approveData = ethers.utils.solidityPack(
          ["uint32","bytes","bytes"],
          [l2Gas,data,data2]
        )
        console.log("approveData :", approveData);
        await wtonContract.connect(testAccount).approveAndCall(
          BridgeSwapContract.address,
          WTONamount1,
          approveData
        )
      })
    })

    describe("#2. TON Deposit Test", () => {
      it("#2-1. TONDeposit is fail before approve", async () => {
        await expect(
          BridgeSwapContract.connect(testAccount).TONDeposit(
            TONamount1,
            l2Gas,
            data
          )
        ).to.be.revertedWith("ton exceeds allowance"); 
      })

      it("#2-2. TONDeposit is success after approve", async () => {
        let beforeTON = await tonContract.balanceOf(testAccount.address)
        // console.log(beforeWTON)
        await tonContract.connect(testAccount).approve(BridgeSwapContract.address, TONamount1);
        let allowanceAmount = await tonContract.allowance(testAccount.address,BridgeSwapContract.address);
        // console.log(allowanceAmount)
        // console.log(WTONamount1)
        expect(allowanceAmount).to.be.equal(TONamount1);
        await BridgeSwapContract.connect(testAccount).TONDeposit(
          TONamount1,
          l2Gas,
          data
        )
        let afterTON = await tonContract.balanceOf(testAccount.address)
        // console.log(afterWTON)
        expect(beforeTON).to.be.gt(afterTON);
      })

      // it("#2-3. TONDeposit can approveAndCall", async () => {
      //   let allowanceAmount = await tonContract.allowance(testAccount.address,BridgeSwapContract.address);
      //   // expect(allowanceAmount).to.be.equal(0)
      //   let data1 = padLeft(l2Gas.toString(16), 64);
      //   let data2 = "0x" + data1;
      //   let data3 = padLeft(bytesData, 64);
      //   console.log(data3);
      //   let data4 = data2 + data3;
      //   console.log(data4);
      //   // console.log("length : ", data2.length);
      //   // console.log(data1)
      //   // console.log(data2)
      //   let beforeTON = await tonContract.balanceOf(testAccount.address)
      //   await tonContract.connect(testAccount).approveAndCall(BridgeSwapContract.address, TONamount1, data4);
      //   let afterTON = await tonContract.balanceOf(testAccount.address)
      //   expect(beforeTON).to.be.gt(afterTON);
      // })
    })

  })

});
