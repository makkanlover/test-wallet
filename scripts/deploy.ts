import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // ERC20トークンのデプロイパラメータ（例）
  const erc20Name = "Test Token";
  const erc20Symbol = "TEST";
  const erc20Decimals = 18;
  const erc20TotalSupply = 1000000; // 1,000,000 tokens
  
  // ERC20コントラクトをデプロイ
  const SimpleERC20 = await ethers.getContractFactory("SimpleERC20");
  const erc20 = await SimpleERC20.deploy(
    erc20Name,
    erc20Symbol,
    erc20Decimals,
    erc20TotalSupply,
    deployer.address
  );

  await erc20.waitForDeployment();
  console.log("SimpleERC20 deployed to:", await erc20.getAddress());

  // ERC721トークンのデプロイパラメータ（例）
  const erc721Name = "Test NFT";
  const erc721Symbol = "TNFT";
  const erc721BaseURI = "https://api.example.com/metadata/";
  
  // ERC721コントラクトをデプロイ
  const SimpleERC721 = await ethers.getContractFactory("SimpleERC721");
  const erc721 = await SimpleERC721.deploy(
    erc721Name,
    erc721Symbol,
    erc721BaseURI,
    deployer.address
  );

  await erc721.waitForDeployment();
  console.log("SimpleERC721 deployed to:", await erc721.getAddress());

  // デプロイ情報を出力
  console.log("\n=== Deployment Summary ===");
  console.log(`ERC20 (${erc20Symbol}): ${await erc20.getAddress()}`);
  console.log(`ERC721 (${erc721Symbol}): ${await erc721.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});