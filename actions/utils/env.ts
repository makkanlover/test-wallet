/**
 * 環境変数取得のユーティリティ関数
 * ブラウザ環境では window.__ENV__ から、Node.js環境では process.env から取得
 */
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // ブラウザ環境での環境変数取得
  if (typeof window !== 'undefined') {
    // サーバーから提供される環境変数
    const envVars = (window as any).__ENV__;
    if (envVars && envVars[key]) {
      return envVars[key];
    }
  }
  
  // Node.js環境（テスト等）
  return process.env[key] || defaultValue;
};