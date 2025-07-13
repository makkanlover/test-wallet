# Web3ウォレットシステム

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)

Web3技術を活用したウォレット管理・操作アプリケーション。ERC20/ERC721コントラクトのデプロイ、トランザクション管理、残高確認等の機能を提供します。

## 🚀 主な機能

- **ウォレット管理**: ローカル秘密鍵・外部ウォレット接続
- **コントラクトデプロイ**: ERC20/ERC721の作成・検証
- **トランザクション**: ネイティブ・トークン送金
- **マルチチェーン対応**: Ethereum Sepolia、Polygon Amoy
- **リアルタイム更新**: 残高・トランザクション状況の自動更新

## 🛠 技術スタック

### フロントエンド
- **React 18** - UIフレームワーク
- **TypeScript** - 型安全性
- **Redux Toolkit** - 状態管理
- **Emotion** - CSS-in-JS
- **React Hook Form** - フォーム管理
- **Vite** - ビルドツール

### バックエンド
- **Node.js** - サーバーランタイム
- **Express風サーバー** - カスタムHTTPサーバー
- **Ethers.js** - ブロックチェーン操作

### ブロックチェーン
- **Hardhat** - 開発環境
- **Hardhat Ignition** - デプロイ管理
- **OpenZeppelin** - 標準コントラクト
- **TypeChain** - コントラクト型生成

### テスト・品質
- **Vitest** - ユニットテスト
- **Playwright** - E2Eテスト・ビジュアルテスト
- **ESLint** - コード品質
- **TypeScript** - 静的型チェック

## 🏗 セットアップ

### 1. 前提条件

- Node.js 18.0.0以上
- npm 8.0.0以上
- Git

### 2. インストール

```bash
# リポジトリクローン
git clone <repository-url>
cd web3-wallet-system

# セットアップ（依存関係インストール + コントラクトコンパイル）
npm run setup
```

### 3. 環境変数設定

`.env`ファイルを作成：

```env
# 秘密鍵（テストネット専用）
PRIVATE_KEY=your_test_private_key

# RPC エンドポイント
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://amoy.infura.io/v3/YOUR_PROJECT_ID

# デフォルトネットワーク
DEFAULT_NETWORK=sepolia

# API キー
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

⚠️ **セキュリティ注意**: テストネット専用の秘密鍵のみ使用してください。

## 🚀 使用方法

### 開発モード

```bash
# フロントエンド開発サーバー（ホットリロード）
npm run dev

# バックエンドサーバー
npm run server
```

### 本番モード

```bash
# ビルド + サーバー起動
npm start

# サーバーのみ
npm run server
```

### その他のコマンド

```bash
# サーバー再起動
npm run restart:linux    # Linux/Mac
npm run restart:windows  # Windows

# コード品質チェック
npm run lint
npm run typecheck

# テスト実行
npm test                 # ユニットテスト
npm run test:e2e         # E2Eテスト
npm run test:coverage    # カバレッジ

# Hardhatコマンド
npm run compile          # コントラクトコンパイル
npm run deploy:sepolia   # Sepoliaにデプロイ

# クリーンアップ
npm run clean           # ビルド成果物削除
```

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