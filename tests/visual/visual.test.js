import { test, expect } from '@playwright/test';

test.describe('Web3 Wallet Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 開発サーバーが動いている場合のURL
    await page.goto('http://localhost:3000');
  });

  test('ウォレット情報ページが正常に読み込まれる', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // タイトルが正しく表示されているか確認
    const title = await page.textContent('title');
    expect(title).toContain('Web3ウォレットシステム');
    
    // 基本的な要素の存在確認
    await expect(page.locator('div#root')).toBeVisible();
  });

  test('基本UI要素の表示確認', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // ナビゲーションの確認
    await expect(page.getByRole('button', { name: '💳 ウォレット情報' })).toBeVisible();
    await expect(page.getByRole('button', { name: '💸 トランザクション' })).toBeVisible();
    await expect(page.getByRole('button', { name: '📄 コントラクト' })).toBeVisible();
  });
});