import type { SupportedChainName } from "./test-task-types"

export interface TokenData {
    id: string
    tokenName: string
    tokenSymbol: string
    tokenAddress: string
    pairAddress: string
    chain: SupportedChainName
    exchange: string
    priceUsd: number
    volumeUsd: number | null
    mcap: number
    priceChangePcs: {
        '5m': number
        '1h': number
        '6h': number
        '24h': number
    }
    transactions: {
        buys: number
        sells: number
    }
    audit: {
        mintable: boolean
        freezable: boolean
        honeypot: boolean
        contractVerified: boolean
    }
    tokenCreatedTimestamp: Date
    liquidity: {
        current: number
        changePc: number
    }
}