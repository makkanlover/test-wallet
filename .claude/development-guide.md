# Web3ウォレットシステム - 開発ガイド

このファイルは、このプロジェクトで開発を継続するAIエージェント向けの技術ドキュメントです。

## プロジェクト概要

Web3ウォレット管理・操作アプリケーション。React + TypeScript + Hardhatを使用し、Ethereum Sepolia/Polygon Amoyテストネットに対応。

### アーキテクチャの特徴
- **フロントエンド**: React 18 + TypeScript + Redux Toolkit + Emotion
- **バックエンド**: Node.js カスタムHTTPサーバー（Express不使用）
- **ブロックチェーン**: Hardhat + Hardhat Ignition + Ethers.js v6
- **テスト**: Vitest（ユニット）+ Playwright（E2E/Visual）

## 重要な実装上の注意点

### 1. ブラウザ・サーバー分離アーキテクチャ

**問題**: ブラウザ環境では`process`オブジェクトが使用できないため、Hardhatの直接実行が不可能

**解決策**: 
- ブラウザ: API呼び出しのみ実行
- サーバー: Node.js環境でHardhat Ignition実行
- API: `/api/deploy`, `/api/estimate-gas`

```javascript
// ブラウザ側（actions/services/deployApiService.ts）
export const deployContract = async (params) => {
  const response = await fetch('http://localhost:3000/api/deploy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
};

// サーバー側（server.js）
if (pathname === '/api/deploy' && req.method === 'POST') {
  const result = await handleDeploy(deployParams);
  res.end(JSON.stringify(result));
}
```

### 2. Hardhat Ignition対話的プロンプト問題

**問題**: Hardhat Ignitionは確認プロンプトを表示するため、サーバー実行時にハングアップ

**解決策**: 
```javascript
// bashシェル経由でecho "y"をパイプ
const deployCommand = `echo "y" | npx hardhat ignition deploy ...`;
const child = spawn('bash', ['-c', deployCommand], {
  cwd: __dirname,
  env: { ...process.env },
  stdio: ['pipe', 'pipe', 'pipe']
});
```

### 3. Windowsパス問題

**問題**: Windowsの`\`パスがHardhatパラメータファイル指定で認識されない

**解決策**:
```javascript
// 相対パスに変換してスラッシュに統一
const relativeParamPath = path.relative(__dirname, paramFilePath).replace(/\\/g, '/');
deployCommand += ` --parameters "${relativeParamPath}"`;
```

### 4. オーナーアドレス算出

**重要**: コントラクトのオーナーは.envの秘密鍵から算出する

```javascript
function getAddressFromPrivateKey(privateKey) {
  const { ethers } = require('ethers');
  const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const wallet = new ethers.Wallet(cleanPrivateKey);
  return wallet.address;
}

// パラメータファイルでオーナー設定
const parameterContent = {
  SimpleERC20: {
    name: params.name,
    symbol: params.symbol,
    decimals: params.decimals || 18,
    totalSupply: params.totalSupply || '1000000',
    owner: getAddressFromPrivateKey(process.env.PRIVATE_KEY) // 固定値ではなく算出
  }
};
```

### 5. 環境変数の取り扱い

**ブラウザへの環境変数提供**:
```javascript
// server.js - /env.js エンドポイント
function getEnvScript() {
  const envVars = {
    ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/',
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || 'https://amoy.infura.io/v3/',
    DEFAULT_NETWORK: process.env.DEFAULT_NETWORK || 'sepolia',
    PRIVATE_KEY: process.env.PRIVATE_KEY || ''
  };
  return `window.__ENV__ = ${JSON.stringify(envVars)};`;
}
```

**Hardhat設定での環境変数読み込み**:
```typescript
// hardhat.config.ts
import * as dotenv from "dotenv";
dotenv.config(); // ES moduleで明示的に読み込み
```

## ファイル構造と役割

### 重要ファイル
- `server.js`: メインサーバー（API + 静的ファイル配信）
- `hardhat.config.ts`: Hardhat設定（ネットワーク・Ignition）
- `contracts/SimpleERC20.sol`: 標準ERC20コントラクト
- `ignition/modules/SimpleERC20.ts`: Ignitionデプロイモジュール

### Redux状態管理
```
actions/
├── slices/           # Redux Toolkit slices
├── thunks/           # 非同期アクション
├── services/         # API・Web3サービス層
└── store/            # ストア設定
```

### UIコンポーネント
```
ui/
├── components/       # 再利用可能コンポーネント
├── pages/           # ページコンポーネント
├── hooks/           # カスタムフック
└── themes/          # テーマ設定
```

## デプロイフロー

1. **パラメータファイル生成**: ユーザー入力 → JSON
2. **Hardhat Ignition実行**: `echo "y" | npx hardhat ignition deploy`
3. **結果パース**: stdout からアドレス抽出
4. **contracts.json保存**: デプロイ情報永続化

```javascript
// デプロイ結果のパース例
const addressMatch = result.stdout.match(/SimpleERC20#SimpleERC20\s*-\s*(0x[a-fA-F0-9]{40})/i);
```

## よくある問題と解決方法

### 1. "process is not defined"
→ ブラウザでNode.js特有のオブジェクトを使用している
→ サーバーAPIに移行する

### 2. "invalid BytesLike value"
→ 古いコンパイル成果物を使用している
→ `npm run compile`でコントラクト再コンパイル

### 3. "Command failed"（Hardhat Ignition）
→ 確認プロンプトで停止している
→ `echo "y"`をパイプで事前送信

### 4. "パラメータファイル読み込みエラー"
→ Windowsパス問題
→ 相対パスに変換、スラッシュに統一

## テスト戦略

### ユニットテスト（Vitest）
- Redux slices/thunks
- サービス層ロジック
- 外部依存（ethers）のモック化

### E2Eテスト（Playwright）
- 実際のブラウザでの操作フロー
- ビジュアルリグレッションテスト
- モック環境での動作確認

### テスト実行
```bash
npm test              # ユニット
npm run test:e2e      # E2E
npm run test:coverage # カバレッジ
```

## 開発時の推奨フロー

1. **機能追加前**: 既存テスト実行で回帰確認
2. **実装**: TypeScript型安全性を重視
3. **テスト追加**: 新機能のテストケース作成
4. **品質チェック**: `npm run lint && npm run typecheck`
5. **E2Eテスト**: ブラウザでの動作確認

## デバッグのコツ

### サーバーサイドデバッグ
```javascript
// server.js - 詳細ログ追加例
console.log('=== デプロイフロー開始 ===');
console.log('ステップ1: パラメータ受信:', params);
console.log('ステップ2: パラメータファイル作成');
// ...
```

### フロントエンドデバッグ
- Redux DevTools Extension使用
- ブラウザ開発者ツールでネットワークタブ確認
- console.logでRedux状態確認

### ブロックチェーンデバッグ
- Hardhatコンソール: `npx hardhat console --network sepolia`
- Etherscan/Polygonscanでトランザクション確認
- RPC接続テスト: `curl -X POST [RPC_URL] -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'`

## セキュリティ考慮事項

1. **秘密鍵管理**: .envでのみ管理、コードにハードコードしない
2. **テストネット限定**: メインネット使用時は十分な検証必要
3. **入力検証**: ユーザー入力の適切なvalidation
4. **API レート制限**: Infura等のAPI制限に注意

## パッケージ管理

### 依存関係更新時の注意
- `ethers`バージョン: v6系で固定（v5とAPIが大きく異なる）
- `hardhat`関連: 互換性確認必要
- `@emotion/*`: CSS-in-JS統一のため全セット必要

### 不要な依存関係は削除済み
- `axios`: fetch APIで十分
- `@walletconnect/*`: 外部ウォレット機能は将来実装
- Jest関連: Vitestに統一

## CI/CD時の注意点

1. **環境変数**: テスト用の.envを別途準備
2. **ネットワーク依存**: 外部APIはモック化
3. **アーティファクト**: `artifacts/`ディレクトリは`.gitignore`済み
4. **テストネットトークン**: CIでは実際の送金テストは避ける

## 今後の拡張ポイント

1. **外部ウォレット連携**: WalletConnect復活
2. **ERC721機能**: NFT関連機能の完全実装
3. **マルチシグ対応**: 複数署名ウォレット
4. **DeFi統合**: Uniswap等との連携
5. **モバイル対応**: PWA化

---

**最重要**: このプロジェクトはブラウザ・サーバー分離アーキテクチャが核心。ブラウザでNode.js固有機能を使おうとすると必ず失敗するため、API経由での実装を徹底すること。