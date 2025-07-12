import { test, expect } from '@playwright/test';

test.describe('Basic App Tests', () => {
  test.beforeEach(async ({ page }) => {
    // アプリケーションページに移動
    await page.goto('http://localhost:5173');
  });

  test('ページが正常に読み込まれる', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/Web3ウォレットシステム/);
    
    // 基本的な要素の存在確認
    await expect(page.locator('#root')).toBeVisible();
  });

  test('ウォレット情報ページの基本要素', async ({ page }) => {
    // ウォレット情報タイトルの確認
    await expect(page.locator('h2')).toContainText('ウォレット情報');
    
    // 接続ボタンの確認
    await expect(page.locator('button')).toContainText('ローカルウォレット接続');
  });

  test('ナビゲーションタブの存在確認', async ({ page }) => {
    // ナビゲーションタブの確認
    await expect(page.locator('text=ウォレット情報')).toBeVisible();
    await expect(page.locator('text=トランザクション')).toBeVisible();
    await expect(page.locator('text=コントラクト')).toBeVisible();
  });
});