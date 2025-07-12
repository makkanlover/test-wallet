# Web3ウォレットシステム

Web3ウォレット管理・操作アプリケーションです。Ethereum SepoliaテストネットとPolygon Amoyテストネットに対応しています。

## 機能

- **ウォレット接続**: 環境変数からの秘密鍵による自動接続
- **ネットワーク切り替え**: SepoliaとAmoy間での切り替えと残高確認
- **トランザクション作成**: ネイティブトークン、ERC20、NFTの送信
- **コントラクトデプロイ**: ERC20/ERC721コントラクトの作成
- **レスポンシブUI**: デスクトップ・タブレット・モバイル対応

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の内容を設定してください：

```env
# プライベートキー（0xプレフィックスなしの64文字のHex文字列）
PRIVATE_KEY=your_private_key_here

# RPCエンドポイント
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
POLYGON_RPC_URL=https://amoy.infura.io/v3/YOUR_INFURA_PROJECT_ID

# デフォルトネットワーク
DEFAULT_NETWORK=sepolia

# アプリケーション設定
APP_NAME=Web3ウォレットシステム
APP_VERSION=1.0.0
```

**注意**: テスト用途でない場合は、`.env.example`を参考に適切な値を設定してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

## 利用可能なコマンド

### 開発
- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクションビルド
- `npm run preview` - ビルド結果のプレビュー

### コード品質
- `npm run typecheck` - TypeScriptの型チェック
- `npm run lint` - ESLintによる静的解析

### テスト
- `npm run test` - 全テストの実行
- `npm run test:unit` - ユニットテストのみ実行
- `npm run test:watch` - ウォッチモードでテスト実行

### ブロックチェーン開発
- `npx hardhat compile` - スマートコントラクトのコンパイル
- `npx hardhat test` - Hardhatテストの実行
- `npx hardhat run scripts/deploy.ts --network sepolia` - Sepoliaへのデプロイ

## 対応ネットワーク

### Ethereum Sepolia テストネット
- **Chain ID**: 11155111
- **通貨**: SepoliaETH
- **エクスプローラー**: https://sepolia.etherscan.io/

### Polygon Amoy テストネット
- **Chain ID**: 80002
- **通貨**: MATIC
- **エクスプローラー**: https://amoy.polygonscan.com/

## セキュリティ

- **秘密鍵管理**: 環境変数で管理し、ソースコードにハードコードしない
- **テストネット専用**: 本番環境では使用しない
- **権限最小化**: 必要最小限の権限のみを使用

## テスト

アプリケーションには以下のテストが含まれています：

- **ユニットテスト**: Redux状態管理とサービス層のテスト
- **コンポーネントテスト**: Reactコンポーネントの動作テスト
- **外部依存のモック**: ethersライブラリなどの外部APIをモック化
- **ビジュアルリグレッションテスト**: UI の見た目の変化を検出

## トラブルシューティング

### Windows環境での実行
PowerShellで `'vite' は、内部コマンドまたは外部コマンド...` エラーが出る場合：

```bash
# npxを使用してコマンドを実行
npx vite
npx vite build
```

### 秘密鍵エラー
「秘密鍵が.envファイルに設定されていません」エラーが出る場合：

1. `.env`ファイルが存在することを確認
2. `PRIVATE_KEY`が正しく設定されていることを確認
3. アプリケーションを再起動

### ネットワーク接続エラー
RPCエンドポイントの接続エラーが出る場合：

1. インターネット接続を確認
2. InfuraプロジェクトIDが有効であることを確認
3. ファイアウォール設定を確認

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。