# GitHub Actions CI/CD Pipeline

## 概要

このプロジェクトでは、GitHub ActionsでCI/CDパイプラインを構築し、プルリクエストのマージ時に自動的にテストを実行して品質を保証しています。

## ワークフロー構成

### CI/CD Pipeline (`.github/workflows/ci.yml`)

プルリクエストとmainブランチへのプッシュで自動実行されます。

#### テストジョブ (`test`)

**実行環境**: Ubuntu Latest
**Node.js バージョン**: 18.x, 20.x (マトリックス実行)

**実行内容**:
1. **コードチェックアウト**: リポジトリのコードを取得
2. **Node.js環境構築**: 指定バージョンのNode.jsをセットアップ
3. **依存関係インストール**: `npm ci`で高速・確実にインストール
4. **コード品質チェック**: 
   - `npm run lint` - ESLintによるコードスタイルチェック
   - `npm run typecheck` - TypeScriptの型チェック
5. **単体テスト実行**: `npm test` - Vitestによるユニットテスト
6. **アプリケーションビルド**: `npm run build` - 本番用ビルド
7. **Playwright環境構築**: ブラウザのインストール
8. **ビジュアルテスト実行**: `npm run test:e2e` - Playwrightによる視覚回帰テスト
9. **テスト結果アップロード**: 失敗時のレポート保存

#### セキュリティジョブ (`security`)

**実行環境**: Ubuntu Latest
**Node.js バージョン**: 20.x

**実行内容**:
1. **依存関係セキュリティ監査**: `npm audit --audit-level=high`
2. **高レベルの脆弱性検出**: 重要度の高い脆弱性をチェック

## プルリクエストのマージ条件

### 必須チェック項目

すべてのプルリクエストは以下の条件をクリアする必要があります：

1. **コードスタイル**: ESLintエラーがないこと
2. **型安全性**: TypeScriptの型チェックが通ること
3. **単体テスト**: すべてのVitestテストが通ること
4. **ビルド**: アプリケーションが正常にビルドできること
5. **ビジュアルテスト**: Playwrightのスナップショットテストが通ること

### Branch Protection Rules設定

GitHub上でブランチ保護ルールを設定する必要があります：

#### 設定手順

1. **リポジトリのSettings** → **Branches** → **Add rule**
2. **Branch name pattern**: `main`
3. **Protect matching branches**で以下を有効化：
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
   - ✅ **Require conversation resolution before merging**
   - ✅ **Require deployments to succeed before merging**

4. **Required status checks**に以下を追加：
   - `test (18.x)` - Node.js 18.x環境でのテスト
   - `test (20.x)` - Node.js 20.x環境でのテスト
   - `security` - セキュリティ監査

## 実行時間の目安

- **単体テスト**: 約30-60秒
- **ビジュアルテスト**: 約60-90秒
- **ビルド**: 約30-45秒
- **トータル**: 約3-5分

## 失敗時の対処法

### 1. ESLintエラー
```bash
npm run lint
# エラーを修正後
npm run lint -- --fix
```

### 2. TypeScriptエラー
```bash
npm run typecheck
# 型エラーを修正
```

### 3. 単体テスト失敗
```bash
npm test
# 失敗したテストを修正
```

### 4. ビジュアルテスト失敗
```bash
npm run test:e2e
# 意図的なUI変更の場合
npm run test:e2e -- --update-snapshots
```

## 開発者向けガイド

### プルリクエスト作成前のチェック

以下のコマンドを実行してローカルでテストを確認：

```bash
# すべてのチェックを実行
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

### CI/CD改善のヒント

1. **並列実行**: マトリックス戦略により複数のNode.jsバージョンで並列テスト
2. **キャッシュ活用**: Node.js setup actionでnpmキャッシュを有効化
3. **アーティファクト保存**: 失敗時の詳細な情報を30日間保存
4. **セキュリティ重視**: 定期的な脆弱性監査を実施

## 監視とメンテナンス

### 定期的なメンテナンス項目

1. **依存関係更新**: 月1回の`npm audit`と`npm update`
2. **Playwright更新**: 新しいブラウザバージョンへの対応
3. **Node.js LTS対応**: 新しいLTSバージョンへの対応
4. **ワークフロー最適化**: 実行時間の短縮と安定性向上

### モニタリング指標

- **成功率**: 90%以上を目標
- **平均実行時間**: 5分以内を目標
- **失敗原因分析**: 月次レポートで改善点を特定