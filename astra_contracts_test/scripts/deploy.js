const hre = require("hardhat");

async function main() {
    const Vault = await hre.ethers.getContractFactory("AstraVaultUserOwned");
    const vault = await Vault.deploy();
    await vault.waitForDeployment();

    console.log("Vault deployed to:", vault.target);
}

main().catch((error) => {
    console.error(error);
})