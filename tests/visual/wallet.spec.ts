import { test, expect } from '@playwright/test';

test.describe('Wallet Page - Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // ページを開く
    await page.goto('/');
    
    // ページが読み込まれるのを待つ
    await page.waitForSelector('text=Web3ウォレット', { timeout: 10000 });
  });

  test('ウォレットページの初期状態（未接続）', async ({ page }) => {
    // ウォレット情報タブがアクティブであることを確認（ボタンのみを指定）
    await expect(page.getByRole('button', { name: '💳 ウォレット情報' })).toBeVisible();
    
    // 未接続状態のUIを確認
    await expect(page.locator('text=未接続')).toBeVisible();
    
    // 画面全体のスナップショット
    await expect(page).toHaveScreenshot('wallet-page-disconnected.png');
  });

  test('ウォレット接続モーダル', async ({ page }) => {
    // ローカルウォレット接続ボタンをクリック
    await page.click('text=ローカルウォレット接続');
    
    // モーダルが開くのを待つ
    await page.waitForSelector('text=秘密鍵', { timeout: 5000 });
    
    // モーダルのスナップショット
    await expect(page).toHaveScreenshot('wallet-connection-modal.png');
  });

  test('ネットワーク情報の表示', async ({ page }) => {
    // ネットワーク情報が表示されていることを確認
    await expect(page.locator('div').filter({ hasText: /^Ethereum Sepolia$/ })).toBeVisible();
    await expect(page).toHaveScreenshot('wallet-network-info.png');
  });

  test('ナビゲーションバーの状態', async ({ page }) => {
    // ナビゲーション部分のスナップショット
    await expect(page.locator('nav')).toHaveScreenshot('navigation-wallet-active.png');
  });
});

test.describe('Transaction Page - Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Web3ウォレット', { timeout: 10000 });
    
    // トランザクションページに移動
    await page.click('text=トランザクション');
    await page.waitForSelector('text=ウォレットが接続されていません', { timeout: 5000 });
  });

  test('トランザクションページの初期状態（未接続）', async ({ page }) => {
    await expect(page).toHaveScreenshot('transaction-page-disconnected.png');
  });

  test('トランザクションタブの表示', async ({ page }) => {
    // ナビゲーション部分のスナップショット
    await expect(page.locator('nav')).toHaveScreenshot('navigation-transaction-active.png');
  });
});

test.describe('Contract Page - Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Web3ウォレット', { timeout: 10000 });
    
    // コントラクトページに移動
    await page.click('text=コントラクト');
    // コントラクトページの読み込みを待つ（一般的な要素で待機）
    await page.waitForSelector('h2', { timeout: 15000 });
  });

  test('コントラクトページの初期状態（ERC20タブ）', async ({ page }) => {
    await expect(page).toHaveScreenshot('contract-page-erc20-tab.png');
  });

  // Note: ERC721タブとコントラクト一覧タブはウォレット接続が必要なため、
  // 基本的なスナップショットテストでは除外

  test('コントラクトページのナビゲーション', async ({ page }) => {
    await expect(page.locator('nav')).toHaveScreenshot('navigation-contract-active.png');
  });
});

test.describe('Settings Page - Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Web3ウォレット', { timeout: 10000 });
    
    // 設定ページに移動
    await page.click('text=設定');
    await page.waitForSelector('text=設定画面（開発中）', { timeout: 5000 });
  });

  test('設定ページの初期状態', async ({ page }) => {
    await expect(page).toHaveScreenshot('settings-page-initial.png');
  });

  test('設定ページのナビゲーション', async ({ page }) => {
    await expect(page.locator('nav')).toHaveScreenshot('navigation-settings-active.png');
  });
});

test.describe('Responsive Design Tests', () => {
  test('モバイルサイズでのレスポンシブ表示', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForSelector('text=Web3ウォレット', { timeout: 10000 });
    
    // モバイルサイズでのスナップショット
    await expect(page).toHaveScreenshot('wallet-page-mobile.png');
  });

  test('タブレットサイズでのレスポンシブ表示', async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForSelector('text=Web3ウォレット', { timeout: 10000 });
    
    // タブレットサイズでのスナップショット
    await expect(page).toHaveScreenshot('wallet-page-tablet.png');
  });
});