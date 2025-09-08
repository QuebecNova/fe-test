import type { ScannerResult, SupportedChainName } from '../types/test-task-types'
import type { TokenData } from '../types/TokenData'

const chainIdToName = (chainId: number): SupportedChainName => {
    switch (chainId.toString()) {
        case '1':
            return 'ETH'
        case '56':
            return 'BSC'
        case '8453':
            return 'BASE'
        case '900':
            return 'SOL'
        default:
            return 'ETH'
    }
}

const calculateMarketCap = (tokenData: ScannerResult): number => {
    if (tokenData.currentMcap && parseFloat(tokenData.currentMcap) > 0) {
        return parseFloat(tokenData.currentMcap)
    }
    if (tokenData.initialMcap && parseFloat(tokenData.initialMcap) > 0) {
        return parseFloat(tokenData.initialMcap)
    }
    if (tokenData.pairMcapUsd && parseFloat(tokenData.pairMcapUsd) > 0) {
        return parseFloat(tokenData.pairMcapUsd)
    }
    if (tokenData.pairMcapUsdInitial && parseFloat(tokenData.pairMcapUsdInitial) > 0) {
        return parseFloat(tokenData.pairMcapUsdInitial)
    }

    const totalSupply = parseFloat(tokenData.token1TotalSupplyFormatted)
    const price = parseFloat(tokenData.price)
    return totalSupply * price
}

export const convertToTokenData = (result: ScannerResult): TokenData => {
    return {
        id: result.pairAddress,
        tokenName: result.token1Name,
        tokenSymbol: result.token1Symbol,
        tokenAddress: result.token1Address,
        pairAddress: result.pairAddress,
        chain: chainIdToName(result.chainId),
        exchange: result.routerAddress,
        priceUsd: parseFloat(result.price ?? '0'),
        volumeUsd: parseFloat(result.volume ?? '0'),
        mcap: calculateMarketCap(result),
        priceChangePcs: {
            '5m': parseFloat(result.diff5M ?? '0'),
            '1h': parseFloat(result.diff1H ?? '0'),
            '6h': parseFloat(result.diff6H ?? '0'),
            '24h': parseFloat(result.diff24H ?? '0'),
        },
        transactions: {
            buys: result.buys || 0,
            sells: result.sells || 0,
        },
        audit: {
            mintable: result.isMintAuthDisabled,
            freezable: result.isFreezeAuthDisabled,
            honeypot: result.honeyPot || false,
            contractVerified: result.contractVerified,
        },
        tokenCreatedTimestamp: new Date(result.age),
        liquidity: {
            current: parseFloat(result.liquidity ?? '0'),
            changePc: parseFloat(result.percentChangeInLiquidity ?? '0'),
        },
    }
}
