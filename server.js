// .envファイルを読み込み
require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// MIMEタイプのマッピング
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// 環境変数をJavaScriptとして提供するエンドポイント
function getEnvScript() {
  const envVars = {
    ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/',
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || 'https://amoy.infura.io/v3/',
    DEFAULT_NETWORK: process.env.DEFAULT_NETWORK || 'sepolia',
    PRIVATE_KEY: process.env.PRIVATE_KEY || ''
  };

  console.log('Providing environment variables to browser:', {
    ...envVars,
    PRIVATE_KEY: envVars.PRIVATE_KEY ? '[SET]' : '[NOT SET]'
  });

  return `
window.__ENV__ = ${JSON.stringify(envVars)};
console.log('Environment variables loaded in browser:', {
  ...window.__ENV__,
  PRIVATE_KEY: window.__ENV__.PRIVATE_KEY ? '[SET]' : '[NOT SET]'
});
`;
}

// デプロイ処理関数
async function handleDeploy(params) {
  const { spawn } = require('child_process');
  
  try {
    console.log('=== デプロイフロー開始 ===');
    console.log('ステップ1: デプロイパラメータ受信:', params);
    
    console.log('ステップ2: パラメータファイル作成開始');
    
    // パラメータファイルを作成
    const fs = require('fs');
    const parameterContent = {
      [params.type === 'erc20' ? 'SimpleERC20' : 'SimpleERC721']: {
        name: params.name,
        symbol: params.symbol,
        ...(params.type === 'erc20' ? {
          decimals: params.decimals || 18,
          totalSupply: params.totalSupply || '1000000'
        } : {
          baseURI: params.baseURI || 'https://example.com/metadata/'
        }),
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // TODO: 実際のアドレスに変更
      }
    };
    
    console.log('パラメータコンテンツ:', JSON.stringify(parameterContent, null, 2));
    
    const paramDir = path.join(__dirname, 'ignition', 'parameters');
    console.log('パラメータディレクトリ:', paramDir);
    
    if (!fs.existsSync(paramDir)) {
      console.log('パラメータディレクトリを作成');
      fs.mkdirSync(paramDir, { recursive: true });
    }
    
    const paramFilePath = path.join(paramDir, `${params.type}-${Date.now()}.json`);
    console.log('パラメータファイルパス:', paramFilePath);
    console.log('パラメータファイルパス（正規化）:', path.resolve(paramFilePath));
    
    fs.writeFileSync(paramFilePath, JSON.stringify(parameterContent, null, 2));
    console.log('ステップ2完了: パラメータファイル作成成功');
    
    // ファイルが正しく作成されたか確認
    if (fs.existsSync(paramFilePath)) {
      console.log('パラメータファイル作成確認: 成功');
      console.log('ファイル内容確認:', fs.readFileSync(paramFilePath, 'utf8'));
    } else {
      throw new Error('パラメータファイルの作成に失敗しました');
    }
    
    // 既存のデプロイメントディレクトリをクリア（--resetの代わり）
    const networkName = params.network || 'sepolia';
    const deploymentId = `${params.type}-${params.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
    const deploymentDir = path.join(__dirname, 'ignition', 'deployments', `chain-${networkName === 'sepolia' ? '11155111' : '80002'}`, deploymentId);
    if (fs.existsSync(deploymentDir)) {
      fs.rmSync(deploymentDir, { recursive: true, force: true });
    }
    
    console.log('ステップ3: Hardhatコマンド構築開始');
    
    // Ignitionデプロイコマンドを構築
    const moduleName = params.type === 'erc20' ? 'SimpleERC20' : 'SimpleERC721';
    // Windowsパスの問題を解決するため、相対パスを使用
    const relativeParamPath = path.relative(__dirname, paramFilePath).replace(/\\/g, '/');
    
    let deployCommand = `echo "y" | npx hardhat ignition deploy ignition/modules/${moduleName}.ts --network ${networkName}`;
    deployCommand += ` --parameters "${relativeParamPath}"`;
    deployCommand += ` --deployment-id ${deploymentId}`;
    
    if (params.verify) {
      deployCommand += ' --verify';
    }
    
    console.log('ステップ3完了: コマンド構築完了');
    console.log('実行コマンド:', deployCommand);
    console.log('使用ネットワーク:', networkName);
    console.log('相対パラメータパス:', relativeParamPath);
    console.log('作業ディレクトリ:', __dirname);
    console.log('環境変数チェック:');
    console.log('- ETHEREUM_RPC_URL:', process.env.ETHEREUM_RPC_URL);
    console.log('- PRIVATE_KEY:', process.env.PRIVATE_KEY ? '設定済み' : '未設定');
    
    console.log('ステップ4: Hardhatコマンド実行開始');
    
    // spawnでデプロイを実行（echo "y"でパイプ経由で自動応答）
    const result = await new Promise((resolve, reject) => {
      console.log('spawn開始: bash -c', deployCommand);
      
      const child = spawn('bash', ['-c', deployCommand], {
        cwd: __dirname,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        console.log('STDOUT:', chunk);
      });
      
      child.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        console.log('STDERR:', chunk);
      });
      
      child.on('close', (code) => {
        console.log('プロセス終了コード:', code);
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', (error) => {
        console.log('プロセスエラー:', error);
        reject(error);
      });
    });
    
    console.log('デプロイ出力:', result.stdout);
    if (result.stderr) {
      console.warn('デプロイ警告:', result.stderr);
    }
    
    // 結果を解析（Hardhat Ignitionの出力形式に対応）
    const addressMatch = result.stdout.match(/SimpleERC20#SimpleERC20\s*-\s*(0x[a-fA-F0-9]{40})/i) || 
                         result.stdout.match(/deployed to:\s*(0x[a-fA-F0-9]{40})/i) ||
                         result.stdout.match(/(0x[a-fA-F0-9]{40})/g);
    const txHashMatch = result.stdout.match(/transaction hash:\s*(0x[a-fA-F0-9]{64})/i);
    const deploymentIdMatch = result.stdout.match(/deployment id:\s*([a-zA-Z0-9-]+)/i);
    
    console.log('アドレスマッチ結果:', addressMatch);
    console.log('フル出力（デバッグ用）:', JSON.stringify(result.stdout));
    
    if (!addressMatch) {
      throw new Error(`デプロイ出力からcontract addressを取得できませんでした。出力: ${result.stdout}`);
    }
    
    // アドレスの抽出（配列の場合は最後のアドレスを取得）
    const contractAddress = Array.isArray(addressMatch) ? 
                           addressMatch[addressMatch.length - 1] : 
                           addressMatch[1];
    
    const deployResult = {
      contractAddress: contractAddress,
      transactionHash: txHashMatch ? txHashMatch[1] : '',
      deploymentId: deploymentIdMatch ? deploymentIdMatch[1] : '',
      verified: params.verify || false,
      success: true
    };
    
    // コントラクト情報をファイルに保存
    await saveContractInfo(params, deployResult);
    
    return deployResult;
    
  } catch (error) {
    console.error('デプロイエラー:', error);
    return {
      contractAddress: '',
      transactionHash: '',
      deploymentId: '',
      verified: false,
      success: false,
      error: error.message
    };
  }
}

// コントラクト情報をファイルに保存
async function saveContractInfo(params, deployResult) {
  const fs = require('fs');
  const contractsFilePath = path.join(__dirname, 'contracts.json');
  
  let contractsData = { contracts: [] };
  if (fs.existsSync(contractsFilePath)) {
    try {
      const data = fs.readFileSync(contractsFilePath, 'utf8');
      contractsData = JSON.parse(data);
    } catch (error) {
      console.error('既存のコントラクトファイル読み込みエラー:', error);
    }
  }
  
  // ABIを取得
  const artifactPath = path.join(__dirname, 'artifacts', 'contracts', `${params.type === 'erc20' ? 'SimpleERC20' : 'SimpleERC721'}.sol`, `${params.type === 'erc20' ? 'SimpleERC20' : 'SimpleERC721'}.json`);
  let abi = [];
  if (fs.existsSync(artifactPath)) {
    try {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      abi = artifact.abi;
    } catch (error) {
      console.error('ABI読み込みエラー:', error);
    }
  }
  
  const newContract = {
    id: `${params.type.toUpperCase()}_${params.name}_${Date.now()}`,
    name: params.name,
    symbol: params.symbol,
    contract_address: deployResult.contractAddress,
    abi: abi,
    type: params.type.toUpperCase(),
    deployedAt: new Date().toISOString(),
    transactionHash: deployResult.transactionHash,
    network: params.network || 'sepolia',
    owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // TODO: 実際のアドレスに変更
  };
  
  contractsData.contracts.push(newContract);
  
  fs.writeFileSync(contractsFilePath, JSON.stringify(contractsData, null, 2));
  console.log('コントラクト情報を保存しました:', newContract);
}

// ガス見積もり処理関数
async function handleEstimateGas(params) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    console.log('ガス見積もりパラメータ:', params);
    
    // ethers.jsを使用してプロバイダー経由でガス見積もりを実行
    const { ethers } = require('ethers');
    const fs = require('fs');
    
    // プロバイダーを作成
    const rpcUrl = params.network === 'amoy' ? 
      process.env.POLYGON_RPC_URL : 
      process.env.ETHEREUM_RPC_URL;
    
    if (!rpcUrl) {
      throw new Error('RPC URLが設定されていません');
    }
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // 秘密鍵からウォレットを作成
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEYが設定されていません');
    }
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // アーティファクトファイルから正しいABIとbytecodeを読み込み
    const contractName = params.type === 'erc20' ? 'SimpleERC20' : 'SimpleERC721';
    const artifactPath = path.join(__dirname, 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
    
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`アーティファクトファイルが見つかりません: ${artifactPath}`);
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // コントラクトファクトリを作成
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    
    // デプロイパラメータを準備
    let deployArgs;
    if (params.type === 'erc20') {
      const decimals = params.decimals || 18;
      const totalSupply = ethers.parseUnits(params.totalSupply || '1000000', decimals);
      const owner = await wallet.getAddress();
      
      deployArgs = [
        params.name,
        params.symbol, 
        decimals,
        totalSupply,
        owner
      ];
    } else {
      const owner = await wallet.getAddress();
      const baseURI = params.baseURI || 'https://example.com/metadata/';
      
      deployArgs = [
        params.name,
        params.symbol,
        baseURI,
        owner
      ];
    }
    
    // ガス見積もりを実行
    const gasLimit = await factory.getDeployTransaction(...deployArgs).then(tx => 
      provider.estimateGas(tx)
    );
    
    // 現在のガス価格を取得
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
    
    // 見積もり手数料を計算
    const estimatedFee = ethers.formatEther(gasLimit * gasPrice);
    
    console.log('ガス見積もり結果:', {
      gasLimit: gasLimit.toString(),
      gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
      estimatedFee
    });
    
    return {
      success: true,
      gasLimit: gasLimit.toString(),
      gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
      estimatedFee
    };
    
  } catch (error) {
    console.error('ガス見積もりエラー:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // デプロイAPIエンドポイント
  if (pathname === '/api/deploy' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const deployParams = JSON.parse(body);
        const result = await handleDeploy(deployParams);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    });
    return;
  }

  // ガス見積もりAPIエンドポイント
  if (pathname === '/api/estimate-gas' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const estimateParams = JSON.parse(body);
        const result = await handleEstimateGas(estimateParams);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    });
    return;
  }

  // 環境変数エンドポイント
  if (pathname === '/env.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    res.end(getEnvScript());
    return;
  }

  // ルートパスの場合はindex.htmlを返す
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // distディレクトリからファイルを提供
  const filePath = path.join(__dirname, 'dist', pathname);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Web3ウォレットシステムサーバー起動: http://localhost:${PORT}`);
  console.log('環境変数:');
  console.log('- PRIVATE_KEY:', process.env.PRIVATE_KEY ? '設定済み' : '未設定');
  console.log('- ETHEREUM_RPC_URL:', process.env.ETHEREUM_RPC_URL || '未設定');
  console.log('- POLYGON_RPC_URL:', process.env.POLYGON_RPC_URL || '未設定');
});