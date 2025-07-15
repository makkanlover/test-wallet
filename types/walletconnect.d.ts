// WalletConnect関連の型定義
export interface WalletConnectOptions {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface WalletConnectProvider {
  enable(): Promise<string[]>;
  request(args: { method: string; params?: any[] }): Promise<any>;
  disconnect(): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  removeListener(event: string, listener: (...args: any[]) => void): void;
}

export interface WalletInfo {
  id: string;
  name: string;
  description: string;
  homepage: string;
  chains: string[];
  app: {
    browser: string;
    ios: string;
    android: string;
    mac: string;
    windows: string;
    linux: string;
  };
  image_id: string;
  image_url: {
    sm: string;
    md: string;
    lg: string;
  };
}

export type WalletType = 'metamask' | 'walletconnect' | 'local';

export interface WalletConnection {
  type: WalletType;
  name: string;
  icon: string;
  isInstalled?: boolean;
  connect: () => Promise<void>;
}