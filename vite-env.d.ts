interface ProcessEnv {
  readonly ETHEREUM_RPC_URL: string
  readonly POLYGON_RPC_URL: string
  readonly DEFAULT_NETWORK: string
  readonly PRIVATE_KEY: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ProcessEnv {}
  }
}