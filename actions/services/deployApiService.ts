// ブラウザ環境でのコントラクトデプロイAPI呼び出しサービス

export interface DeployApiParams {
  type: 'erc20' | 'erc721';
  name: string;
  symbol: string;
  decimals?: number;
  totalSupply?: string;
  baseURI?: string;
  network: string;
  verify?: boolean;
  gasBufferMultiplier?: number;
}

export interface DeployApiResult {
  contractAddress: string;
  transactionHash: string;
  deploymentId: string;
  verified: boolean;
  success: boolean;
  error?: string;
}

export class DeployApiService {
  private static instance: DeployApiService;

  static getInstance(): DeployApiService {
    if (!DeployApiService.instance) {
      DeployApiService.instance = new DeployApiService();
    }
    return DeployApiService.instance;
  }

  async deployContract(params: DeployApiParams): Promise<DeployApiResult> {
    try {
      const response = await fetch('http://localhost:3000/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        contractAddress: '',
        transactionHash: '',
        deploymentId: '',
        verified: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}