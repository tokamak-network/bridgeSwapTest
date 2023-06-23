import { HardhatUserConfig, task } from "hardhat/config";
import { ethers } from "hardhat";

task("hello", "Prints 'Hello, World!'", async () => {
  console.log("Hello, World!");
});