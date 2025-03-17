export interface Handler {
  address: string
  name: string
}

export interface TokenInfo {
  chain_id: string
  address: string
  name: string
  symbol: string
  decimals: number
  icon: string
  handlers: Handler[]
}
export interface TokenList {
  chain_id: string
  address: string
  name: string
  symbol: string
  decimals: number
  icon: string
  handlers: Handler[]
}
export interface TokenListResponse {
  success: boolean
  data: TokenList[]
}
