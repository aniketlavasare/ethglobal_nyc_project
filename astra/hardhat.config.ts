import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";   // <-- add this line
// no toolbox import here

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};
export default config;
