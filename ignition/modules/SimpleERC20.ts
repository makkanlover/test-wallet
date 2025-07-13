import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export interface ERC20DeployParams {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
}

const SimpleERC20Module = buildModule("SimpleERC20", (m) => {
  // パラメータの定義
  const name = m.getParameter("name", "Default Token");
  const symbol = m.getParameter("symbol", "DTK");
  const decimals = m.getParameter("decimals", 18);
  const totalSupply = m.getParameter("totalSupply", "1000000");
  const owner = m.getParameter("owner", "0x0000000000000000000000000000000000000000");

  // コントラクトのデプロイ
  const simpleERC20 = m.contract("SimpleERC20", [
    name,
    symbol,
    decimals,
    totalSupply,
    owner
  ]);

  return { simpleERC20 };
});

export default SimpleERC20Module;