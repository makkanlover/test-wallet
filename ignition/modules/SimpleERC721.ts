import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export interface ERC721DeployParams {
  name: string;
  symbol: string;
  baseURI: string;
  owner: string;
}

const SimpleERC721Module = buildModule("SimpleERC721", (m) => {
  // パラメータの定義
  const name = m.getParameter("name", "Default NFT");
  const symbol = m.getParameter("symbol", "DNFT");
  const baseURI = m.getParameter("baseURI", "https://example.com/metadata/");
  const owner = m.getParameter("owner", "0x0000000000000000000000000000000000000000");

  // コントラクトのデプロイ
  const simpleERC721 = m.contract("SimpleERC721", [
    name,
    symbol,
    baseURI,
    owner
  ]);

  return { simpleERC721 };
});

export default SimpleERC721Module;