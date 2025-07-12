import { test, expect } from '@playwright/test';

// ページ読み込み前にモックを設定
test.beforeEach(async ({ page }) => {
  // ethersライブラリをモック
  await page.addInitScript(() => {
    // モック用データ
    const MOCK_ADDRESS = '0x742d35Cc8Bb5e54DFBE08774c9F49c1CeFb2a8C3';
    const MOCK_BALANCE = '1500000000000000000'; // 1.5 ETH in wei
    const MOCK_TX_HASH = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    // ethersオブジェクトのモック
    window.ethers = {
      JsonRpcProvider: class MockProvider {
        constructor(url) {
          this.url = url;
        }
        async getBalance() {
          return MOCK_BALANCE;
        }
        async estimateGas() {
          return 21000n;
        }
        async getFeeData() {
          return {
            gasPrice: 20000000000n, // 20 gwei
            maxFeePerGas: 25000000000n,
            maxPriorityFeePerGas: 2000000000n
          };
        }
      },
      
      Wallet: class MockWallet {
        constructor(privateKey, provider) {
          this.privateKey = privateKey;
          this.provider = provider;
        }
        async getAddress() {
          return MOCK_ADDRESS;
        }
        async sendTransaction(tx) {
          return {
            hash: MOCK_TX_HASH,
            wait: async () => ({
              status: 1,
              transactionHash: MOCK_TX_HASH,
              blockNumber: 12345,
              gasUsed: 21000n
            })
          };
        }
      },
      
      formatEther: (value) => {
        if (value === MOCK_BALANCE) return '1.5';
        return '0.0';
      },
      
      parseEther: (value) => {
        return BigInt(Math.floor(parseFloat(value) * 1e18));
      },
      
      formatUnits: (value, units) => {
        if (units === 'gwei') return '20';
        return '0';
      },
      
      parseUnits: (value, units) => {
        if (units === 'gwei') return BigInt(Math.floor(parseFloat(value) * 1e9));
        return 0n;
      },
      
      isAddress: (address) => {
        return address && address.length === 42 && address.startsWith('0x');
      }
    };

    // process.envのモック
    window.process = {
      env: {
        ETHEREUM_RPC_URL: 'https://sepolia.infura.io/v3/test',
        POLYGON_RPC_URL: 'https://amoy.infura.io/v3/test',
        DEFAULT_NETWORK: 'sepolia',
        PRIVATE_KEY: '321d68ca900f2837d3c6d0020e953685afe6846ab3bfe32e137d2a40df5d167e'
      }
    };
  });

  // アプリケーションページに移動
  await page.goto('http://localhost:3000');
});

test.describe('Web3 Wallet Visual Tests (Mocked)', () => {
  test('ウォレット情報ページが正常に表示される', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // タイトルの確認
    await expect(page.getByRole('heading', { name: 'ウォレット情報' })).toBeVisible();
    
    // 未接続状態の確認
    await expect(page.locator('text=❌ 未接続')).toBeVisible();
    
    // 接続ボタンの確認
    await expect(page.locator('text=ローカルウォレット接続')).toBeVisible();
    
    // スクリーンショット比較
    await expect(page).toHaveScreenshot('wallet-info-page.png');
  });

  test('ウォレット接続モーダルが正常に表示される', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // 接続ボタンをクリック
    await page.click('text=ローカルウォレット接続');
    
    // モーダルが表示されることを確認
    await expect(page.locator('text=ローカルウォレット接続').nth(1)).toBeVisible();
    await expect(page.locator('text=環境変数から秘密鍵を取得してローカルウォレットに接続します。')).toBeVisible();
    
    // ネットワーク選択の確認
    await expect(page.locator('label', { hasText: 'ネットワーク' })).toBeVisible();
    await expect(page.locator('select[name="network"]')).toBeVisible();
  });

  test('ネットワーク選択機能', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // 接続ボタンをクリック
    await page.click('text=ローカルウォレット接続');
    
    // ネットワーク選択を変更
    await page.selectOption('select', 'amoy');
    
    // Polygon Amoyが選択されていることを確認
    const selectedValue = await page.$eval('select', el => el.value);
    expect(selectedValue).toBe('amoy');
  });

  test('ナビゲーションタブの表示確認', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // ナビゲーションタブの確認
    await expect(page.getByRole('button', { name: '💳 ウォレット情報' })).toBeVisible();
    await expect(page.getByRole('button', { name: '💸 トランザクション' })).toBeVisible();
    await expect(page.getByRole('button', { name: '📄 コントラクト' })).toBeVisible();
  });

  test('トランザクションページに切り替え', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // トランザクションタブをクリック
    await page.getByRole('button', { name: '💸 トランザクション' }).click();
    
    // トランザクションページの表示確認
    await expect(page.locator('text=ウォレットが接続されていません')).toBeVisible();
  });

  test('コントラクトページに切り替え', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // コントラクトタブをクリック
    await page.getByRole('button', { name: '📄 コントラクト' }).click();
    
    // ページ遷移を待つ
    await page.waitForTimeout(3000);
    
    // コントラクトページの表示確認：ウォレット未接続時のメッセージを確認
    await expect(page.getByText('コントラクトをデプロイするには、まずウォレットを接続してください。')).toBeVisible();
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 基本要素が表示されることを確認
    await expect(page.getByRole('heading', { name: 'ウォレット情報' })).toBeVisible();
    await expect(page.locator('text=❌ 未接続')).toBeVisible();
    
    // タブレットサイズに変更
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'ウォレット情報' })).toBeVisible();
  });
});