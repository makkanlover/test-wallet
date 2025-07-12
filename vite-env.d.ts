/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ETHEREUM_RPC_URL: string
  readonly VITE_POLYGON_RPC_URL: string
  readonly VITE_DEFAULT_NETWORK: string
  readonly VITE_PRIVATE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}