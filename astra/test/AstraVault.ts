import { expect } from "chai";
import hre from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";

const { ethers } = hre;
const hash = (s: string) => keccak256(toUtf8Bytes(s.toLowerCase().trim()));

describe("AstraVault (hashed + allowlist)", () => {
  const TAGS = ["travel", "defi user", "nft collector"];
  const ALLOWED = TAGS.map(hash);

  it("deploys with an allowlist", async () => {
    const Factory = await ethers.getContractFactory("AstraVault");
    const vault = await Factory.deploy(ALLOWED);
    await vault.waitForDeployment();

    console.log("Deployed AstraVault at:", await vault.getAddress());
    TAGS.forEach((t, i) => console.log(`Tag "${t}" hash = ${ALLOWED[i]}`));

    // spot check one allowed tag
    const isAllowed = await vault.allowedTags(ALLOWED[0]);
    console.log(`Allowed? ${TAGS[0]} →`, isAllowed);
    expect(isAllowed).to.equal(true);
  });

  it("stores allowed hashed tags and can read them", async () => {
    const [user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("AstraVault");
    const vault = await Factory.deploy(ALLOWED);
    await vault.waitForDeployment();

    console.log("User address:", user.address);

    const tags = [hash("travel"), hash("defi user")];
    console.log("Submitting tags:", tags);
    await (await vault.connect(user).createOrUpdateVault(tags)).wait();

    const stored = await vault.getUserTagsHashed(user.address);
    console.log("Stored tags:", stored);
    const active = await vault.active(user.address);
    console.log("Vault active?", active);

    expect(stored).to.deep.equal(tags);
    expect(active).to.equal(true);
  });

  it("rejects tags not in the allowlist", async () => {
    const [user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("AstraVault");
    const vault = await Factory.deploy(ALLOWED);
    await vault.waitForDeployment();

    const bad = [hash("super secret")];
    console.log("Trying with bad tag:", bad[0]);
    await expect(vault.connect(user).createOrUpdateVault(bad)).to.be.revertedWith("Tag not allowed");
  });

  it("enforces a small tag limit", async () => {
    const Factory = await ethers.getContractFactory("AstraVault");
    const vault = await Factory.deploy(ALLOWED);
    await vault.waitForDeployment();

    const tooMany = Array.from({ length: 11 }, () => ALLOWED[0]);
    console.log("Submitting too many tags:", tooMany.length);
    await expect(vault.createOrUpdateVault(tooMany)).to.be.revertedWith("Too many tags");
  });

  it("can revoke the vault (tombstone)", async () => {
    const [user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("AstraVault");
    const vault = await Factory.deploy(ALLOWED);
    await vault.waitForDeployment();

    await (await vault.connect(user).createOrUpdateVault([ALLOWED[0]])).wait();
    console.log("Vault created for:", user.address);

    const activeBefore = await vault.active(user.address);
    console.log("Active before revoke:", activeBefore);

    await (await vault.connect(user).revokeVault()).wait();
    const activeAfter = await vault.active(user.address);
    console.log("Active after revoke:", activeAfter);

    expect(activeBefore).to.equal(true);
    expect(activeAfter).to.equal(false);
  });
});
