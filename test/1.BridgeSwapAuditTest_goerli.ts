import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

const WTON_ABI = require("../abis/WTON.json");
const TON_ABI = require("../abis/TON.json");
const WETH_ABI = require("../abis/WETH.json");
const L1StandardBridge_ABI = require("../abis/L1StandardBridge.json");

const { padLeft } = require('web3-utils');

describe("BridgeSwapTest", function () {
  let wtonHaveAccount = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea";

  let testAccount : any
  let test1 : any

  let BridgeSwapContract: any

  let wtonContract: any
  let tonContract: any
  let wethContract: any
  let L1BridgeContract: any

  let tonAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00";

  let wtonAddress = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6"
  let l1TokenAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00"
  let l2TokenAddress = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
  let l1BridgeAddress = "0x7377F3D0F64d7a54Cf367193eb74a052ff8578FD"
  
  let wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"

  let l2Gas = 200000
  // let l2Gas = 1300000
  let data = "0x00"
  let data2 = "0x00"
  let bytesData = "00"

  let depositAmount = ethers.utils.parseUnits("1", 18);
  let WTONamount1 = ethers.utils.parseUnits("1", 27);
  let WTONamount2 = ethers.utils.parseUnits("2", 27);
  let TONamount1 = ethers.utils.parseUnits("1", 18);
  let TONamount2 = ethers.utils.parseUnits("2", 18);
  let WETHamount1 = ethers.utils.parseUnits("1", 17);

  before('account setting', async () => {
    [test1] = await ethers.getSigners();
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

    it("set weth", async () => {
      wethContract = new ethers.Contract(wethAddress, WETH_ABI, testAccount);
    })

    it("set L1BrigdeLogic", async () => {
      L1BridgeContract = new ethers.Contract(l1BridgeAddress, L1StandardBridge_ABI.abi, testAccount)
    })

    it("Deploy the BridgeSwapTest", async function () {
      // We don't use the fixture here because we want a different deployment
      const BridgeSwap = await ethers.getContractFactory("BridgeSwap");
      BridgeSwapContract = await BridgeSwap.connect(testAccount).deploy(
        tonAddress,
        wtonAddress,
        l2TokenAddress,
        l1BridgeAddress,
        wethAddress
      );
    });
  });

  describe("BridgeSwapTest", () => {
    describe("#1. WTON Deposit Test", () => {
      it("#1-0. send the WTON", async () => {
        let beforeWTON = await wtonContract.balanceOf(test1.address);
        expect(beforeWTON).to.be.equal(0);
        await wtonContract.connect(testAccount).transfer(test1.address, WTONamount1);
        let afterWTON = await wtonContract.balanceOf(test1.address);
        expect(afterWTON).to.be.equal(WTONamount1)
      })

      it("#1-1. WTONDepoist is fail before approve", async () => {
        await expect(
          BridgeSwapContract.connect(test1).depositWTON(
            WTONamount1,
            l2Gas,
            data
          )
        ).to.be.revertedWith("wton exceeds allowance"); 
      })

      it("#1-2. WTONDeposit is success after approve", async () => {
        let beforeWTON = await wtonContract.balanceOf(test1.address)
        expect(beforeWTON).to.be.equal(WTONamount1)
        await wtonContract.connect(test1).approve(BridgeSwapContract.address, WTONamount1);
        let allowanceAmount = await wtonContract.allowance(test1.address,BridgeSwapContract.address);
        expect(allowanceAmount).to.be.equal(WTONamount1);
        let beforeL1Bridge = await tonContract.balanceOf(L1BridgeContract.address)
        console.log("beforeL1Bridge :", beforeL1Bridge);
        let tx = await BridgeSwapContract.connect(test1).depositWTON(
          WTONamount1,
          l2Gas,
          data
        )
        const receipt = await tx.wait();
        let evlength = receipt.events.length
        let eventWTON = receipt.events[evlength-1].args.wtonAmount;
        let eventTON = receipt.events[evlength-1].args.tonAmount;
        let eventSender = receipt.events[evlength-1].args.sender;
        expect(WTONamount1).to.be.equal(eventWTON)
        expect(TONamount1).to.be.equal(eventTON)
        expect(test1.address).to.be.equal(eventSender)

        let _function ="ERC20DepositInitiated(address,address,address,address,uint256,bytes)";
        let L1Bridgeinterface = L1BridgeContract.interface;

        let l1BridgeEventTo
        let l1BridgeEventAmount
        
        for(let i=0; i< receipt.events.length; i++){
          if(receipt.events[i].topics[0] == L1Bridgeinterface.getEventTopic(_function)){
              let data = receipt.events[i].data;
              // console.log("data :",data)
              let topics = receipt.events[i].topics;
              // console.log("topics :",topics)
              let log = L1Bridgeinterface.parseLog(
              {  data,  topics } );
              l1BridgeEventTo = log.args._to;
              l1BridgeEventAmount = log.args._amount;
            }
        }

        expect(l1BridgeEventTo).to.be.equal(test1.address)
        expect(l1BridgeEventAmount).to.be.equal(TONamount1)
        let afterL1Bridge = await tonContract.balanceOf(L1BridgeContract.address)
        console.log("afterL1Bridge :",afterL1Bridge)
        let diffAmount = afterL1Bridge.sub(beforeL1Bridge)
        console.log("diffAmount :",diffAmount)
        expect(diffAmount).to.be.equal(TONamount1)

        let afterWTON = await wtonContract.balanceOf(test1.address)
        expect(afterWTON).to.be.equal(0);
      })

      it("#1-3. WTON approveAndCall Test", async () => {
        await wtonContract.connect(testAccount).transfer(test1.address, WTONamount1);
        const approveData = ethers.utils.solidityPack(
          ["uint32","bytes"],
          [l2Gas,data]
        )
        // console.log("approveData :", approveData);
        let beforeWTON = await wtonContract.balanceOf(test1.address)
        expect(beforeWTON).to.be.equal(WTONamount1)
        let beforeL1Bridge = await tonContract.balanceOf(L1BridgeContract.address)
        // console.log("beforeL1Bridge :", beforeL1Bridge);
        let tx = await wtonContract.connect(test1).approveAndCall(
          BridgeSwapContract.address,
          WTONamount1,
          approveData
        )

        const receipt = await tx.wait();
        let _function ="DepositedWTON(address,uint256,uint256)";
        let Bridgeinterface = BridgeSwapContract.interface;

        let eventWTON
        let eventTON
        let eventSender

        for(let i=0; i< receipt.events.length; i++){
            if(receipt.events[i].topics[0] == Bridgeinterface.getEventTopic(_function)){
                // console.log("111111");
                // console.log(Bridgeinterface.getEventTopic(_function));
                // console.log(receipt.events[i].topics[0])
                // console.log("111111");
                let data = receipt.events[i].data;
                // console.log("data :",data)
                let topics = receipt.events[i].topics;
                // console.log("topics :",topics)
                let log = Bridgeinterface.parseLog(
                {  data,  topics } );
                eventWTON = log.args.wtonAmount;
                eventTON = log.args.tonAmount;
                eventSender = log.args.sender;
            }
        }

        expect(WTONamount1).to.be.equal(eventWTON)
        expect(TONamount1).to.be.equal(eventTON)
        expect(test1.address).to.be.equal(eventSender)

        let _function2 ="ERC20DepositInitiated(address,address,address,address,uint256,bytes)";
        let L1Bridgeinterface = L1BridgeContract.interface;

        let l1BridgeEventTo
        let l1BridgeEventAmount
        
        for(let i=0; i< receipt.events.length; i++){
          if(receipt.events[i].topics[0] == L1Bridgeinterface.getEventTopic(_function2)){
              let data = receipt.events[i].data;
              // console.log("data :",data)
              let topics = receipt.events[i].topics;
              // console.log("topics :",topics)
              let log = L1Bridgeinterface.parseLog(
              {  data,  topics } );
              l1BridgeEventTo = log.args._to;
              l1BridgeEventAmount = log.args._amount;
            }
        }

        expect(l1BridgeEventTo).to.be.equal(test1.address)
        expect(l1BridgeEventAmount).to.be.equal(TONamount1)
        let afterL1Bridge = await tonContract.balanceOf(L1BridgeContract.address)
        // console.log("afterL1Bridge :",afterL1Bridge)
        let diffAmount = afterL1Bridge.sub(beforeL1Bridge)
        console.log("diffAmount :",diffAmount)
        expect(diffAmount).to.be.equal(TONamount1)

        let afterWTON = await wtonContract.balanceOf(test1.address)
        expect(afterWTON).to.be.equal(0);
      })

      it("#1-4. WTON approveAndCall calldata Test", async () => {
        await wtonContract.connect(testAccount).transfer(test1.address, WTONamount1);
        const approveData = ethers.utils.solidityPack(
          ["uint32","bytes","bytes"],
          [l2Gas,data,data2]
        )
        let beforeWTON = await wtonContract.balanceOf(test1.address)
        expect(beforeWTON).to.be.equal(WTONamount1)

        let beforeL1Bridge = await tonContract.balanceOf(L1BridgeContract.address)
        // console.log("beforeL1Bridge :", beforeL1Bridge);
        
        // console.log("approveData :", approveData);
        let tx = await wtonContract.connect(test1).approveAndCall(
          BridgeSwapContract.address,
          WTONamount1,
          approveData
        )

        const receipt = await tx.wait();
        let _function ="DepositedWTON(address,uint256,uint256)";
        let Bridgeinterface = BridgeSwapContract.interface;

        let eventWTON
        let eventTON
        let eventSender

        for(let i=0; i< receipt.events.length; i++){
            if(receipt.events[i].topics[0] == Bridgeinterface.getEventTopic(_function)){
                // console.log("111111");
                // console.log(Bridgeinterface.getEventTopic(_function));
                // console.log(receipt.events[i].topics[0])
                // console.log("111111");
                let data = receipt.events[i].data;
                // console.log("data :",data)
                let topics = receipt.events[i].topics;
                // console.log("topics :",topics)
                let log = Bridgeinterface.parseLog(
                {  data,  topics } );
                eventWTON = log.args.wtonAmount;
                eventTON = log.args.tonAmount;
                eventSender = log.args.sender;
            }
        }
        expect(WTONamount1).to.be.equal(eventWTON)
        expect(TONamount1).to.be.equal(eventTON)
        expect(test1.address).to.be.equal(eventSender)

        let _function2 ="ERC20DepositInitiated(address,address,address,address,uint256,bytes)";
        let L1Bridgeinterface = L1BridgeContract.interface;

        let l1BridgeEventTo
        let l1BridgeEventAmount
        
        for(let i=0; i< receipt.events.length; i++){
          if(receipt.events[i].topics[0] == L1Bridgeinterface.getEventTopic(_function2)){
              let data = receipt.events[i].data;
              // console.log("data :",data)
              let topics = receipt.events[i].topics;
              // console.log("topics :",topics)
              let log = L1Bridgeinterface.parseLog(
              {  data,  topics } );
              l1BridgeEventTo = log.args._to;
              l1BridgeEventAmount = log.args._amount;
            }
        }

        expect(l1BridgeEventTo).to.be.equal(test1.address)
        expect(l1BridgeEventAmount).to.be.equal(TONamount1)
        let afterL1Bridge = await tonContract.balanceOf(L1BridgeContract.address)
        // console.log("afterL1Bridge :",afterL1Bridge)
        let diffAmount = afterL1Bridge.sub(beforeL1Bridge)
        console.log("diffAmount :",diffAmount)
        expect(diffAmount).to.be.equal(TONamount1)

        let afterWTON = await wtonContract.balanceOf(test1.address)
        expect(afterWTON).to.be.equal(0);
      })
    })

    describe("#2. TON Deposit Test", () => {
      it("#2-0. send the TON", async () => {
        let beforeTON = await tonContract.balanceOf(test1.address);
        expect(beforeTON).to.be.equal(0);
        await tonContract.connect(testAccount).transfer(test1.address, TONamount1);
        let afterTON = await tonContract.balanceOf(test1.address);
        expect(afterTON).to.be.equal(TONamount1)
      })

      it("#2-1. TONDeposit is fail before approve", async () => {
        await expect(
          BridgeSwapContract.connect(testAccount).depositTON(
            TONamount1,
            l2Gas,
            data
          )
        ).to.be.revertedWith("ton exceeds allowance"); 
      })

      it("#2-2. TONDeposit is success after approve", async () => {
        let beforeTON = await tonContract.balanceOf(test1.address)
        expect(beforeTON).to.be.equal(TONamount1)
        await tonContract.connect(test1).approve(BridgeSwapContract.address, TONamount1);
        let allowanceAmount = await tonContract.allowance(test1.address,BridgeSwapContract.address);
        expect(allowanceAmount).to.be.equal(TONamount1);
        
        let beforeL1Bridge = await tonContract.balanceOf(L1BridgeContract.address)
        // console.log("beforeL1Bridge :", beforeL1Bridge);
        
        let tx = await BridgeSwapContract.connect(test1).depositTON(
          TONamount1,
          l2Gas,
          data
        )

        const receipt = await tx.wait();
        // console.log(receipt)
        // console.log(receipt.events)
        let evlength = receipt.events.length
    
        let eventTON = receipt.events[evlength-1].args.tonAmount;
        let eventSender = receipt.events[evlength-1].args.sender;

        expect(TONamount1).to.be.equal(eventTON)
        expect(test1.address).to.be.equal(eventSender)

        let _function2 ="ERC20DepositInitiated(address,address,address,address,uint256,bytes)";
        let L1Bridgeinterface = L1BridgeContract.interface;

        let l1BridgeEventTo
        let l1BridgeEventAmount
        
        for(let i=0; i< receipt.events.length; i++){
          if(receipt.events[i].topics[0] == L1Bridgeinterface.getEventTopic(_function2)){
              let data = receipt.events[i].data;
              // console.log("data :",data)
              let topics = receipt.events[i].topics;
              // console.log("topics :",topics)
              let log = L1Bridgeinterface.parseLog(
              {  data,  topics } );
              l1BridgeEventTo = log.args._to;
              l1BridgeEventAmount = log.args._amount;
            }
        }

        expect(l1BridgeEventTo).to.be.equal(test1.address)
        expect(l1BridgeEventAmount).to.be.equal(TONamount1)
        let afterL1Bridge = await tonContract.balanceOf(L1BridgeContract.address)
        // console.log("afterL1Bridge :",afterL1Bridge)
        let diffAmount = afterL1Bridge.sub(beforeL1Bridge)
        console.log("diffAmount :",diffAmount)
        expect(diffAmount).to.be.equal(TONamount1)

        let afterTON = await tonContract.balanceOf(test1.address)
        expect(afterTON).to.be.equal(0)
      })

      it("#2-3. TONDeposit can approveAndCall", async () => {
        await tonContract.connect(testAccount).transfer(test1.address, TONamount1);
        const approveData = ethers.utils.solidityPack(
          ["uint32","bytes","bytes"],
          [l2Gas,data,data2]
        )
        let beforeTON = await tonContract.balanceOf(test1.address)
        expect(beforeTON).to.be.equal(TONamount1)
        
        let beforeL1Bridge = await tonContract.balanceOf(L1BridgeContract.address)
        // console.log("beforeL1Bridge :", beforeL1Bridge);
        
        let tx = await tonContract.connect(test1).approveAndCall(
          BridgeSwapContract.address, 
          TONamount1, 
          approveData
        );
        const receipt = await tx.wait();
    
        let _function ="DepositedTON(address,uint256)";
        let Bridgeinterface = BridgeSwapContract.interface;

        let eventTON
        let eventSender

        for(let i=0; i< receipt.events.length; i++){
            if(receipt.events[i].topics[0] == Bridgeinterface.getEventTopic(_function)){
                let data = receipt.events[i].data;
                // console.log("data :",data)
                let topics = receipt.events[i].topics;
                // console.log("topics :",topics)
                let log = Bridgeinterface.parseLog(
                {  data,  topics } );
                eventTON = log.args.tonAmount;
                eventSender = log.args.sender;
            }
        }
        
        expect(TONamount1).to.be.equal(eventTON)
        expect(test1.address).to.be.equal(eventSender)

        let _function2 ="ERC20DepositInitiated(address,address,address,address,uint256,bytes)";
        let L1Bridgeinterface = L1BridgeContract.interface;

        let l1BridgeEventTo
        let l1BridgeEventAmount
        
        for(let i=0; i< receipt.events.length; i++){
          if(receipt.events[i].topics[0] == L1Bridgeinterface.getEventTopic(_function2)){
              let data = receipt.events[i].data;
              // console.log("data :",data)
              let topics = receipt.events[i].topics;
              // console.log("topics :",topics)
              let log = L1Bridgeinterface.parseLog(
              {  data,  topics } );
              l1BridgeEventTo = log.args._to;
              l1BridgeEventAmount = log.args._amount;
            }
        }

        expect(l1BridgeEventTo).to.be.equal(test1.address)
        expect(l1BridgeEventAmount).to.be.equal(TONamount1)
        let afterL1Bridge = await tonContract.balanceOf(L1BridgeContract.address)
        // console.log("afterL1Bridge :",afterL1Bridge)
        let diffAmount = afterL1Bridge.sub(beforeL1Bridge)
        console.log("diffAmount :",diffAmount)
        expect(diffAmount).to.be.equal(TONamount1)

        let afterTON = await tonContract.balanceOf(test1.address)
        expect(afterTON).to.be.equal(0);
      })
    })

    describe("#3. WETH Deposit", () => {
      it("#3-0. send the WETH", async () => {
        let beforeWETH = await wethContract.balanceOf(test1.address);
        await wethContract.connect(testAccount).transfer(test1.address, WETHamount1);
        let afterWETH = await wethContract.balanceOf(test1.address);
        let diffAmount = afterWETH.sub(beforeWETH)
        expect(diffAmount).to.be.equal(WETHamount1)
      })

      it("#3-1. depositWETH is fail before approve", async () => {
        await expect(
          BridgeSwapContract.connect(testAccount).depositWETH(
            WETHamount1,
            l2Gas,
            data
          )
        ).to.be.revertedWith("weth exceeds allowance"); 
      })

      it("#3-2. depositWETH is success after approve", async () => {
        let beforeWETH = await wethContract.balanceOf(test1.address)
        await wethContract.connect(test1).approve(BridgeSwapContract.address, WETHamount1);
        let allowanceAmount = await wethContract.allowance(test1.address,BridgeSwapContract.address);
        expect(allowanceAmount).to.be.equal(WETHamount1);

        let beforeL1Bridge = await ethers.provider.getBalance(L1BridgeContract.address);
        console.log("beforeL1Bridge : ", beforeL1Bridge);
        // let beforeL1Bridge2 = await ethers.provider.getBalance(BridgeSwapContract.address);
        // console.log("beforeL1Bridge2 : ", beforeL1Bridge2);

        let tx = await BridgeSwapContract.connect(test1).depositWETH(
          WETHamount1,
          l2Gas,
          data
        )

        const receipt = await tx.wait();

        let _function ="DepositWETH(address,uint)";
        let Bridgeinterface = BridgeSwapContract.interface;

        let eventWETH
        let eventSender

        for(let i=0; i< receipt.events.length; i++){
            if(receipt.events[i].topics[0] == Bridgeinterface.getEventTopic(_function)){
                // console.log("111111");
                // console.log(Bridgeinterface.getEventTopic(_function));
                // console.log(receipt.events[i].topics[0])
                // console.log("111111");
                let data = receipt.events[i].data;
                // console.log("data :",data)
                let topics = receipt.events[i].topics;
                // console.log("topics :",topics)
                let log = Bridgeinterface.parseLog(
                {  data,  topics } );
                eventWETH = log.args.wethAmount;
                eventSender = log.args.sender;
            }
        }
        expect(WETHamount1).to.be.equal(eventWETH)
        expect(test1.address).to.be.equal(eventSender)

        let _function2 ="ETHDepositInitiated(address,address,uint256,bytes)";
        let L1Bridgeinterface = L1BridgeContract.interface;

        let l1BridgeEventTo
        let l1BridgeEventAmount
        
        for(let i=0; i< receipt.events.length; i++){
          if(receipt.events[i].topics[0] == L1Bridgeinterface.getEventTopic(_function2)){
              let data = receipt.events[i].data;
              // console.log("data :",data)
              let topics = receipt.events[i].topics;
              // console.log("topics :",topics)
              let log = L1Bridgeinterface.parseLog(
              {  data,  topics } );
              l1BridgeEventTo = log.args._to;
              l1BridgeEventAmount = log.args._amount;
            }
        }
        // console.log("l1BridgeEventTo: ", l1BridgeEventTo)
        // console.log("l1BridgeEventAmount: ", l1BridgeEventAmount)
        expect(l1BridgeEventTo).to.be.equal(test1.address)
        expect(l1BridgeEventAmount).to.be.equal(WETHamount1)

        let afterL1Bridge = await ethers.provider.getBalance(L1BridgeContract.address);
        let diffETHAmount = afterL1Bridge.sub(beforeL1Bridge)
        // console.log("afterL1Bridge : ", afterL1Bridge);
        // console.log("diffETHAmount : ", diffETHAmount);
        // let afterL1Bridge2 = await ethers.provider.getBalance(BridgeSwapContract.address);
        // let diffETHAmount2 = afterL1Bridge2.sub(beforeL1Bridge2)
        // console.log("afterL1Bridge2 : ", afterL1Bridge2);
        // console.log("diffETHAmount2 : ", diffETHAmount2);
        expect(diffETHAmount).to.be.equal(WETHamount1);

        let afterWETH = await wethContract.balanceOf(test1.address)
        let diffWETHAmount = beforeWETH.sub(afterWETH)
        expect(diffWETHAmount).to.be.equal(WETHamount1);
      })
    })

    describe("#4. WETH ERC20 Deposit", () => {
      it("#4-0. send the WETH", async () => {
        let beforeWETH = await wethContract.balanceOf(test1.address);
        await wethContract.connect(testAccount).transfer(test1.address, WETHamount1);
        let afterWETH = await wethContract.balanceOf(test1.address);
        let diffAmount = afterWETH.sub(beforeWETH)
        expect(diffAmount).to.be.equal(WETHamount1)
      })

      it("#4-1. depositWETHERC20 is fail before approve", async () => {
        await expect(
          BridgeSwapContract.connect(testAccount).depositWETHERC20(
            WETHamount1,
            l2Gas,
            data
          )
        ).to.be.revertedWith("weth exceeds allowance"); 
      })

      it("#4-2. depositWETH is success after approve", async () => {
        let beforeWETH = await wethContract.balanceOf(test1.address)
        await wethContract.connect(test1).approve(BridgeSwapContract.address, WETHamount1);
        let allowanceAmount = await wethContract.allowance(test1.address,BridgeSwapContract.address);
        expect(allowanceAmount).to.be.equal(WETHamount1);

        // let beforeL1Bridge = await ethers.provider.getBalance(L1BridgeContract.address);
        // console.log("beforeL1Bridge : ", beforeL1Bridge);
        // let beforeL1Bridge2 = await ethers.provider.getBalance(BridgeSwapContract.address);
        // console.log("beforeL1Bridge2 : ", beforeL1Bridge2);
        let beforeL1Bridge = await wethContract.balanceOf(L1BridgeContract.address);
        console.log("beforeL1Bridge : ", beforeL1Bridge);

        let tx = await BridgeSwapContract.connect(test1).depositWETHERC20(
          WETHamount1,
          l2Gas,
          data
        )

        const receipt = await tx.wait();

        let _function ="DepositWETH(address,uint)";
        let Bridgeinterface = BridgeSwapContract.interface;

        let eventWETH
        let eventSender

        for(let i=0; i< receipt.events.length; i++){
            if(receipt.events[i].topics[0] == Bridgeinterface.getEventTopic(_function)){
                // console.log("111111");
                // console.log(Bridgeinterface.getEventTopic(_function));
                // console.log(receipt.events[i].topics[0])
                // console.log("111111");
                let data = receipt.events[i].data;
                // console.log("data :",data)
                let topics = receipt.events[i].topics;
                // console.log("topics :",topics)
                let log = Bridgeinterface.parseLog(
                {  data,  topics } );
                eventWETH = log.args.wethAmount;
                eventSender = log.args.sender;
            }
        }
        expect(WETHamount1).to.be.equal(eventWETH)
        expect(test1.address).to.be.equal(eventSender)

        let _function2 ="ERC20DepositInitiated(address,address,address,address,uint256,bytes)";
        let L1Bridgeinterface = L1BridgeContract.interface;

        let l1BridgeEventTo
        let l1BridgeEventAmount
        
        for(let i=0; i< receipt.events.length; i++){
          if(receipt.events[i].topics[0] == L1Bridgeinterface.getEventTopic(_function2)){
              let data = receipt.events[i].data;
              // console.log("data :",data)
              let topics = receipt.events[i].topics;
              // console.log("topics :",topics)
              let log = L1Bridgeinterface.parseLog(
              {  data,  topics } );
              l1BridgeEventTo = log.args._to;
              l1BridgeEventAmount = log.args._amount;
            }
        }
        console.log("l1BridgeEventTo: ", l1BridgeEventTo)
        console.log("l1BridgeEventAmount: ", l1BridgeEventAmount)
        expect(l1BridgeEventTo).to.be.equal(test1.address)
        expect(l1BridgeEventAmount).to.be.equal(WETHamount1)

        // let afterL1Bridge = await ethers.provider.getBalance(L1BridgeContract.address);
        // let diffETHAmount = afterL1Bridge.sub(beforeL1Bridge)
        // console.log("afterL1Bridge : ", afterL1Bridge);
        // console.log("diffETHAmount : ", diffETHAmount);
        // let afterL1Bridge2 = await ethers.provider.getBalance(BridgeSwapContract.address);
        // let diffETHAmount2 = afterL1Bridge2.sub(beforeL1Bridge2)
        // console.log("afterL1Bridge2 : ", afterL1Bridge2);
        // console.log("diffETHAmount2 : ", diffETHAmount2);
        // expect(diffETHAmount).to.be.equal(WETHamount1);

        let afterL1Bridge = await wethContract.balanceOf(L1BridgeContract.address);
        console.log("afterL1Bridge : ", afterL1Bridge);

        let afterWETH = await wethContract.balanceOf(test1.address)
        let diffWETHAmount = beforeWETH.sub(afterWETH)
        expect(diffWETHAmount).to.be.equal(WETHamount1);
      })
    })
  })

});
