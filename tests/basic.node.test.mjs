// 基本的なNodeテスト（テスト環境確認用）
import assert from 'assert';

console.log('テスト開始...');

// 環境変数のテスト
process.env.PRIVATE_KEY = '321d68ca900f2837d3c6d0020e953685afe6846ab3bfe32e137d2a40df5d167e';
process.env.DEFAULT_NETWORK = 'sepolia';

assert.strictEqual(process.env.PRIVATE_KEY, '321d68ca900f2837d3c6d0020e953685afe6846ab3bfe32e137d2a40df5d167e', '秘密鍵設定OK');
assert.strictEqual(process.env.DEFAULT_NETWORK, 'sepolia', 'デフォルトネットワーク設定OK');

// 基本的な関数テスト
function validateAddress(address) {
  return address && address.length === 42 && address.startsWith('0x');
}

function validatePrivateKey(privateKey) {
  const cleanKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  return cleanKey.length === 66 && /^0x[0-9a-fA-F]{64}$/.test(cleanKey);
}

// バリデーション関数のテスト
assert.strictEqual(validateAddress('0x742d35Cc8Bb5e54DFBE08774c9F49c1CeFb2a8C3'), true, 'アドレス検証OK');
assert.strictEqual(validateAddress('invalid'), false, '無効アドレス検証OK');

assert.strictEqual(validatePrivateKey('321d68ca900f2837d3c6d0020e953685afe6846ab3bfe32e137d2a40df5d167e'), true, '秘密鍵検証OK');
assert.strictEqual(validatePrivateKey('0x321d68ca900f2837d3c6d0020e953685afe6846ab3bfe32e137d2a40df5d167e'), true, '0x付き秘密鍵検証OK');
assert.strictEqual(validatePrivateKey('invalid'), false, '無効秘密鍵検証OK');

// ネットワーク設定のテスト
const networks = {
  sepolia: {
    id: 'sepolia',
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    currency: 'SepoliaETH'
  },
  amoy: {
    id: 'amoy',
    name: 'Polygon Amoy',
    chainId: 80002,
    currency: 'MATIC'
  }
};

assert.strictEqual(networks.sepolia.chainId, 11155111, 'Sepolia Chain ID OK');
assert.strictEqual(networks.amoy.chainId, 80002, 'Amoy Chain ID OK');

console.log('✅ 全ての基本テストがパスしました！');
console.log('- 環境変数テスト: OK');
console.log('- アドレス検証テスト: OK');
console.log('- 秘密鍵検証テスト: OK');
console.log('- ネットワーク設定テスト: OK');