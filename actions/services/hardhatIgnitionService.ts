import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface IgnitionDeployParams {
  type: 'erc20' | 'erc721';
  name: string;
  symbol: string;
  decimals?: number;
  totalSupply?: string;
  baseURI?: string;
  network: string;
  verify?: boolean;
}

export interface IgnitionDeployResult {
  contractAddress: string;
  transactionHash: string;
  deploymentId: string;
  verified: boolean;
}

export class HardhatIgnitionService {
  private static instance: HardhatIgnitionService;

  static getInstance(): HardhatIgnitionService {
    if (!HardhatIgnitionService.instance) {
      HardhatIgnitionService.instance = new HardhatIgnitionService();
    }
    return HardhatIgnitionService.instance;
  }

  async deployERC20(params: IgnitionDeployParams): Promise<IgnitionDeployResult> {
    if (params.type !== 'erc20') {
      throw new Error('無効なcontract type: ERC20が期待されます');
    }

    const decimals = params.decimals || 18;
    const totalSupply = params.totalSupply || '1000000';
    
    // owner addressを取得（秘密鍵から導出）
    const ownerAddress = await this.getOwnerAddress();

    // Hardhat Ignitionパラメータを準備
    const ignitionParams = {
      name: params.name,
      symbol: params.symbol,
      decimals: decimals,
      totalSupply: totalSupply,
      owner: ownerAddress
    };

    return this.runIgnitionDeploy('SimpleERC20', ignitionParams, params.network, params.verify);
  }

  async deployERC721(params: IgnitionDeployParams): Promise<IgnitionDeployResult> {
    if (params.type !== 'erc721') {
      throw new Error('無効なcontract type: ERC721が期待されます');
    }

    const baseURI = params.baseURI || 'https://example.com/metadata/';
    
    // owner addressを取得（秘密鍵から導出）
    const ownerAddress = await this.getOwnerAddress();

    // Hardhat Ignitionパラメータを準備
    const ignitionParams = {
      name: params.name,
      symbol: params.symbol,
      baseURI: baseURI,
      owner: ownerAddress
    };

    return this.runIgnitionDeploy('SimpleERC721', ignitionParams, params.network, params.verify);
  }

  private async getOwnerAddress(): Promise<string> {
    try {
      const { stdout } = await execAsync('npx hardhat ignition deploy --dry-run --show-stack-traces', {
        cwd: process.cwd(),
        env: { ...process.env }
      });
      
      // dry-runの結果からアドレスを抽出
      const addressMatch = stdout.match(/deployer.*?(0x[a-fA-F0-9]{40})/);
      if (addressMatch) {
        return addressMatch[1];
      }
      
      throw new Error('デプロイヤーアドレスを取得できませんでした');
    } catch (error) {
      throw new Error(`アドレス取得に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async runIgnitionDeploy(
    moduleName: string,
    parameters: Record<string, any>,
    network: string,
    verify: boolean = false
  ): Promise<IgnitionDeployResult> {
    try {
      // パラメータファイルを作成
      const paramFilePath = await this.createParameterFile(moduleName, parameters);
      
      // Ignitionデプロイコマンドを構築
      let deployCommand = `npx hardhat ignition deploy ignition/modules/${moduleName}.ts --network ${network}`;
      deployCommand += ` --parameters ${paramFilePath}`;
      
      if (verify) {
        deployCommand += ' --verify';
      }

      console.log('Hardhat Ignitionデプロイコマンド:', deployCommand);

      // デプロイを実行
      const { stdout, stderr } = await execAsync(deployCommand, {
        cwd: process.cwd(),
        env: { ...process.env },
        timeout: 300000 // 5分のタイムアウト
      });

      console.log('デプロイ出力:', stdout);
      if (stderr) {
        console.warn('デプロイ警告:', stderr);
      }

      // 結果を解析
      const result = this.parseDeployOutput(stdout);
      result.verified = verify;

      return result;
    } catch (error) {
      throw new Error(`Ignitionデプロイに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createParameterFile(moduleName: string, parameters: Record<string, any>): Promise<string> {
    const fs = await import('fs');
    const parameterContent = {
      [moduleName]: parameters
    };

    const paramDir = path.join(process.cwd(), 'ignition', 'parameters');
    await fs.promises.mkdir(paramDir, { recursive: true });
    
    const paramFilePath = path.join(paramDir, `${moduleName}-${Date.now()}.json`);
    await fs.promises.writeFile(paramFilePath, JSON.stringify(parameterContent, null, 2));
    
    return paramFilePath;
  }

  private parseDeployOutput(output: string): IgnitionDeployResult {
    // Ignitionの出力からcontract address, transaction hash, deployment IDを抽出
    const addressMatch = output.match(/deployed to:\s*(0x[a-fA-F0-9]{40})/i);
    const txHashMatch = output.match(/transaction hash:\s*(0x[a-fA-F0-9]{64})/i);
    const deploymentIdMatch = output.match(/deployment id:\s*([a-zA-Z0-9-]+)/i);

    if (!addressMatch) {
      throw new Error('デプロイ出力からcontract addressを取得できませんでした');
    }

    return {
      contractAddress: addressMatch[1],
      transactionHash: txHashMatch ? txHashMatch[1] : '',
      deploymentId: deploymentIdMatch ? deploymentIdMatch[1] : '',
      verified: false // verifyは別途設定
    };
  }

  async verifyContract(contractAddress: string, constructorArgs: any[], network: string): Promise<boolean> {
    try {
      const verifyCommand = `npx hardhat verify --network ${network} ${contractAddress} ${constructorArgs.join(' ')}`;
      
      console.log('Verify コマンド:', verifyCommand);
      
      const { stdout, stderr } = await execAsync(verifyCommand, {
        cwd: process.cwd(),
        env: { ...process.env },
        timeout: 120000 // 2分のタイムアウト
      });

      console.log('Verify 出力:', stdout);
      if (stderr) {
        console.warn('Verify 警告:', stderr);
      }

      // 成功判定
      return stdout.includes('Successfully verified') || stdout.includes('Already verified');
    } catch (error) {
      console.error('Verify エラー:', error);
      return false;
    }
  }
}