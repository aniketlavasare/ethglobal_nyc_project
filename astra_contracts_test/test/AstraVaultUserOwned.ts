import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "hardhatOp",
  chainType: "op",
});
const { expect } = require("chai");

describe("AstraVaultUserOwned", () => {
    it('makes a vault', async () => {
        const Vault = await ethers.getContractFactory("AstraVaultUserOwned");
        const vault = await Vault.deploy();

        console.log('success');
})

// function tags(...t: string[]) {
//     return t;
//   }
//   function makeTags(n: number, prefix = "t"): string[] {
//     return Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);
//   }
//   const LONG_32_BYTES = "a".repeat(32);
//   const LONG_33_BYTES = "a".repeat(33);
  
//   describe("AstraVaultUserOwned", () => {
//     async function deployFixture() {
//       const [u1, u2, u3] = await ethers.getSigners();
//       const F = await ethers.getContractFactory("AstraVaultUserOwned");
//       const vault = await F.deploy();
//       await vault.waitForDeployment();
//       return { vault, u1, u2, u3 };
//     }
  
//     it("deploys", async () => {
//       const { vault } = await loadFixture(deployFixture);
//       expect(await vault.hasVault(ethers.ZeroAddress)).to.equal(false);
//     });
  
//     describe("createVault", () => {
//       it("creates once with initial tags and emits event", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         const tx = await vault.connect(u1).createVault(tags("defi", "nfts"));
//         await expect(tx)
//           .to.emit(vault, "VaultCreated")
//           .withArgs(await u1.getAddress(), ["defi", "nfts"], await time.latest());
  
//         expect(await vault.hasVault(await u1.getAddress())).to.equal(true);
//         const mine = await vault.connect(u1).getMyTags();
//         expect(mine).to.deep.equal(["defi", "nfts"]);
//         const publicView = await vault.getUserTags(await u1.getAddress());
//         expect(publicView).to.deep.equal(["defi", "nfts"]);
//       });
  
//       it("reverts if called twice by same user", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         await vault.connect(u1).createVault(tags("a"));
//         await expect(vault.connect(u1).createVault(tags("b")))
//           .to.be.revertedWith("vault already exists");
//       });
  
//       it("enforces max tag count (10)", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         await expect(vault.connect(u1).createVault(makeTags(11)))
//           .to.be.revertedWith("too many tags");
//       });
  
//       it("enforces tag length (<=31 bytes) and non-empty", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         await expect(vault.connect(u1).createVault(tags("")))
//           .to.be.revertedWith("bad tag length");
//         await expect(vault.connect(u1).createVault(tags(LONG_33_BYTES)))
//           .to.be.revertedWith("bad tag length");
//         // exactly 32 is not allowed by your check; 31 is OK
//         await expect(vault.connect(u1).createVault(tags(LONG_32_BYTES)))
//           .to.be.revertedWith("bad tag length");
//         await vault.connect(u1).createVault(tags("a".repeat(31))); // OK
//       });
  
//       it("rejects duplicate initial tags", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         await expect(vault.connect(u1).createVault(tags("defi", "defi")))
//           .to.be.revertedWith("duplicate tag");
//       });
//     });
  
//     describe("addTag", () => {
//       it("adds a new tag for owner and emits event", async () => {
//         const { vault, u1, u2 } = await loadFixture(deployFixture);
//         await vault.connect(u1).createVault(tags("defi"));
//         const tx = await vault.connect(u1).addTag("nfts");
//         await expect(tx)
//           .to.emit(vault, "TagAdded")
//           .withArgs(await u1.getAddress(), "nfts", await time.latest());
  
//         expect(await vault.connect(u1).getMyTags()).to.deep.equal(["defi", "nfts"]);
  
//         // u2 cannot modify u1's vault; addTag affects caller only
//         await expect(vault.connect(u2).removeTag("defi")) // u2 has no vault at all
//           .to.be.revertedWith("no vault");
//       });
  
//       it("prevents duplicates and enforces MAX_TAGS", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         await vault.connect(u1).createVault(tags("a", "b", "c", "d", "e", "f", "g", "h", "i"));
//         await vault.connect(u1).addTag("j");
//         await expect(vault.connect(u1).addTag("j")).to.be.revertedWith("duplicate tag");
//         await expect(vault.connect(u1).addTag("k")).to.be.revertedWith("max tags reached");
//       });
  
//       it("requires an existing vault", async () => {
//         const { vault, u2 } = await loadFixture(deployFixture);
//         await expect(vault.connect(u2).addTag("x")).to.be.revertedWith("no vault");
//       });
  
//       it("enforces tag length", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         await vault.connect(u1).createVault(tags("ok"));
//         await expect(vault.connect(u1).addTag(""))
//           .to.be.revertedWith("bad tag length");
//         await expect(vault.connect(u1).addTag(LONG_33_BYTES))
//           .to.be.revertedWith("bad tag length");
//       });
//     });
  
//     describe("removeTag", () => {
//       it("removes an existing tag and emits event", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         await vault.connect(u1).createVault(tags("defi", "nfts", "gaming"));
//         const tx = await vault.connect(u1).removeTag("nfts");
//         await expect(tx)
//           .to.emit(vault, "TagRemoved")
//           .withArgs(await u1.getAddress(), "nfts", await time.latest());
  
//         const mine = await vault.connect(u1).getMyTags();
//         expect(mine).to.have.members(["defi", "gaming"]);
//         expect(mine).to.have.length(2);
//       });
  
//       it("reverts when tag not found", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         await vault.connect(u1).createVault(tags("defi"));
//         await expect(vault.connect(u1).removeTag("nfts"))
//           .to.be.revertedWith("tag not found");
//       });
  
//       it("requires an existing vault", async () => {
//         const { vault, u2 } = await loadFixture(deployFixture);
//         await expect(vault.connect(u2).removeTag("x")).to.be.revertedWith("no vault");
//       });
//     });
  
//     describe("clearVault", () => {
//       it("clears all tags and emits event", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         await vault.connect(u1).createVault(tags("a", "b", "c"));
//         const tx = await vault.connect(u1).clearVault();
//         await expect(tx)
//           .to.emit(vault, "VaultCleared")
//           .withArgs(await u1.getAddress(), await time.latest());
  
//         const mine = await vault.connect(u1).getMyTags();
//         expect(mine).to.deep.equal([]);
//       });
  
//       it("requires an existing vault", async () => {
//         const { vault, u2 } = await loadFixture(deployFixture);
//         await expect(vault.connect(u2).clearVault()).to.be.revertedWith("no vault");
//       });
//     });
  
//     describe("views", () => {
//       it("getMyTags and getUserTags are consistent", async () => {
//         const { vault, u1, u2 } = await loadFixture(deployFixture);
//         await vault.connect(u1).createVault(tags("alpha", "beta"));
//         expect(await vault.connect(u1).getMyTags()).to.deep.equal(["alpha", "beta"]);
//         expect(await vault.getUserTags(await u1.getAddress())).to.deep.equal(["alpha", "beta"]);
//         // u2 has no vault
//         expect(await vault.connect(u2).getMyTags()).to.deep.equal([]);
//         expect(await vault.getUserTags(await u2.getAddress())).to.deep.equal([]);
//       });
  
//       it("hasVault reflects state", async () => {
//         const { vault, u1 } = await loadFixture(deployFixture);
//         expect(await vault.hasVault(await u1.getAddress())).to.equal(false);
//         await vault.connect(u1).createVault(tags("x"));
//         expect(await vault.hasVault(await u1.getAddress())).to.equal(true);
//         await vault.connect(u1).clearVault();
//         // vault still exists (ownership), only tags cleared — hasVault remains true
//         expect(await vault.hasVault(await u1.getAddress())).to.equal(true);
//       });
//     });
//   });