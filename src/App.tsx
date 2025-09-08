import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FilterPanel } from './components/Filters'
import { TokenTable } from './components/TokenTable'
import { convertToTokenData } from './helpers/convertToTokenData'
import { useScannerData } from './hooks/useScannerData'
import { useWebSocket } from './hooks/useWebSocket'
import type {
    GetScannerResultParams,
    IncomingWebSocketMessage,
    PairStatsMsgData,
    ScannerPairsEventPayload,
    TickEventPayload,
} from './types/test-task-types'
import type { TokenData } from './types/TokenData'

const TRENDING_TOKENS_FILTERS: GetScannerResultParams = {
    rankBy: 'volume',
    orderBy: 'desc',
    minVol24H: 1000,
    isNotHP: true,
    maxAge: 7 * 24 * 60 * 60,
}

const NEW_TOKENS_FILTERS: GetScannerResultParams = {
    rankBy: 'age',
    orderBy: 'desc',
    maxAge: 24 * 60 * 60,
    isNotHP: true,
}

const ScannerTables: React.FC = () => {
    const [trendingFilters, setTrendingFilters] = useState<GetScannerResultParams>(TRENDING_TOKENS_FILTERS)
    const [newTokensFilters, setNewTokensFilters] = useState<GetScannerResultParams>(NEW_TOKENS_FILTERS)

    const [trendingSortConfig, setTrendingSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'volumeUsd',
        direction: 'desc',
    })

    const [newTokensSortConfig, setNewTokensSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'tokenCreatedTimestamp',
        direction: 'desc',
    })

    const trendingData = useScannerData(trendingFilters)
    const newTokensData = useScannerData(newTokensFilters)

    const trendingDataRef = useRef(trendingData)
    const newTokensDataRef = useRef(newTokensData)

    useEffect(() => {
        trendingDataRef.current = trendingData
    }, [trendingData])

    useEffect(() => {
        newTokensDataRef.current = newTokensData
    }, [newTokensData])

    const handleWebSocketMessage = useCallback((message: IncomingWebSocketMessage) => {
        try {
            const currentTrendingData = trendingDataRef.current.getCurrentData()
            const currentNewTokensData = newTokensDataRef.current.getCurrentData()

            switch (message.event) {
                case 'tick':
                    handleTickEvent(message.data, currentTrendingData, currentNewTokensData)
                    break
                case 'pair-stats':
                    handlePairStatsEvent(message.data, currentTrendingData, currentNewTokensData)
                    break
                case 'scanner-pairs':
                    handleScannerPairsEvent(message.data)
                    break
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error, message)
        }
    }, [])

    const handleTickEvent = useCallback(
        (data: TickEventPayload, trendingData: TokenData[], newTokensData: TokenData[]) => {
            const pairAddress = data.pair.pair
            const latestSwap = data.swaps.filter((swap) => !swap.isOutlier).pop()
            if (!latestSwap) return

            const newPrice = parseFloat(latestSwap.priceToken1Usd)
            const isBuy = latestSwap.tokenInAddress === data.pair.token
            const tradeVolume = parseFloat(latestSwap.amountToken1) * newPrice

            const trendingToken = trendingData.find((token) => token.id === pairAddress)
            if (trendingToken) {
                trendingDataRef.current.updateTokenData(pairAddress, {
                    priceUsd: newPrice,
                    volumeUsd: trendingToken.volumeUsd + tradeVolume,
                    transactions: {
                        buys: trendingToken.transactions.buys + (isBuy ? 1 : 0),
                        sells: trendingToken.transactions.sells + (isBuy ? 0 : 1),
                    },
                })
            }

            const newToken = newTokensData.find((token) => token.id === pairAddress)
            if (newToken) {
                newTokensDataRef.current.updateTokenData(pairAddress, {
                    priceUsd: newPrice,
                    volumeUsd: newToken.volumeUsd + tradeVolume,
                    transactions: {
                        buys: newToken.transactions.buys + (isBuy ? 1 : 0),
                        sells: newToken.transactions.sells + (isBuy ? 0 : 1),
                    },
                })
            }
        },
        []
    )

    const handlePairStatsEvent = useCallback(
        (data: PairStatsMsgData, trendingData: TokenData[], newTokensData: TokenData[]) => {
            const pairAddress = data.pair.pairAddress

            const trendingToken = trendingData.find((token) => token.id === pairAddress)
            if (trendingToken) {
                trendingDataRef.current.updateTokenData(pairAddress, {
                    audit: {
                        mintable: data.pair.mintAuthorityRenounced,
                        freezable: data.pair.freezeAuthorityRenounced,
                        honeypot: !data.pair.token1IsHoneypot,
                        contractVerified: data.pair.isVerified,
                    },
                })
            }

            const newToken = newTokensData.find((token) => token.id === pairAddress)
            if (newToken) {
                newTokensDataRef.current.updateTokenData(pairAddress, {
                    audit: {
                        mintable: data.pair.mintAuthorityRenounced,
                        freezable: data.pair.freezeAuthorityRenounced,
                        honeypot: !data.pair.token1IsHoneypot,
                        contractVerified: data.pair.isVerified,
                    },
                })
            }
        },
        []
    )

    const handleScannerPairsEvent = useCallback((data: ScannerPairsEventPayload) => {
        const newPairs = data.results.pairs || []
        const newTokens = newPairs.map(convertToTokenData)

        trendingDataRef.current.updateData((prevTokens) => {
            return mergeTokenData(prevTokens, newTokens, trendingFilters)
        })

        newTokensDataRef.current.updateData((prevTokens) => {
            return mergeTokenData(prevTokens, newTokens, newTokensFilters)
        })
    }, [])

    const { send, isConnected } = useWebSocket(import.meta.env.VITE_WS_URL, handleWebSocketMessage)

    const mergeTokenData = (
        existingTokens: TokenData[],
        newTokens: TokenData[],
        filters: GetScannerResultParams
    ): TokenData[] => {
        const existingTokenMap = new Map(existingTokens.map((token) => [token.id, token]))
        const filteredNewTokens: TokenData[] = []

        for (const newToken of newTokens) {
            if (passesFilters(newToken, filters)) {
                filteredNewTokens.push(newToken)
            }
        }

        const mergedTokens = filteredNewTokens.map((newToken) => {
            const existingToken = existingTokenMap.get(newToken.id)

            if (existingToken) {
                return {
                    ...newToken,
                    priceUsd: existingToken.priceUsd,
                    mcap: existingToken.mcap,
                    volumeUsd: Math.max(newToken.volumeUsd, existingToken.volumeUsd),
                    transactions: {
                        buys: Math.max(newToken.transactions.buys, existingToken.transactions.buys),
                        sells: Math.max(newToken.transactions.sells, existingToken.transactions.sells),
                    },
                    liquidity: {
                        ...newToken.liquidity,
                        current: Math.max(newToken.liquidity.current, existingToken.liquidity.current),
                    },
                    audit: existingToken.audit || newToken.audit,
                }
            }

            return newToken
        })

        return mergedTokens
    }

    const passesFilters = (token: TokenData, filters: GetScannerResultParams): boolean => {
        if (filters.chain && token.chain !== filters.chain) {
            return false
        }

        if (filters.minVol24H && token.volumeUsd < filters.minVol24H) {
            return false
        }
        if (filters.maxVol24H && token.volumeUsd > filters.maxVol24H) {
            return false
        }

        if (filters.maxAge) {
            const tokenAge = (Date.now() - token.tokenCreatedTimestamp.getTime()) / 1000
            if (tokenAge > filters.maxAge) {
                return false
            }
        }
        if (filters.minAge) {
            const tokenAge = (Date.now() - token.tokenCreatedTimestamp.getTime()) / 1000
            if (tokenAge < filters.minAge) {
                return false
            }
        }

        if (filters.isNotHP && token.audit.honeypot) {
            return false
        }

        if (filters.isVerified && !token.audit.contractVerified) {
            return false
        }

        if (filters.minLiq && token.liquidity.current < filters.minLiq) {
            return false
        }
        if (filters.maxLiq && token.liquidity.current > filters.maxLiq) {
            return false
        }

        if (filters.minBuys24H && token.transactions.buys < filters.minBuys24H) {
            return false
        }
        if (filters.minSells24H && token.transactions.sells < filters.minSells24H) {
            return false
        }
        if (filters.minTxns24H && token.transactions.buys + token.transactions.sells < filters.minTxns24H) {
            return false
        }

        return true
    }

    useEffect(() => {
        if (!isConnected) return
        const subscribeToToken = (token: TokenData) => {
            send({
                event: 'subscribe-pair',
                data: {
                    pair: token.pairAddress,
                    token: token.tokenAddress,
                    chain: token.chain,
                },
            })

            send({
                event: 'subscribe-pair-stats',
                data: {
                    pair: token.pairAddress,
                    token: token.tokenAddress,
                    chain: token.chain,
                },
            })
        }

        trendingData.data.forEach(subscribeToToken)
        newTokensData.data.forEach(subscribeToToken)

        send({
            event: 'scanner-filter',
            data: trendingFilters,
        })

        send({
            event: 'scanner-filter',
            data: newTokensFilters,
        })
    }, [trendingData.data, newTokensData.data, trendingFilters, newTokensFilters, send, isConnected])

    const handleTrendingSort = useCallback((key: string) => {
        setTrendingSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
    }, [])

    const handleNewTokensSort = useCallback((key: string) => {
        setNewTokensSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
    }, [])

    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj)
    }

    const sortedTrendingData = useMemo(() => {
        return [...trendingData.data].sort((a, b) => {
            const aValue = getNestedValue(a, trendingSortConfig.key)
            const bValue = getNestedValue(b, trendingSortConfig.key)

            if (aValue < bValue) {
                return trendingSortConfig.direction === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return trendingSortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
        })
    }, [trendingData.data, trendingSortConfig])

    const sortedNewTokensData = useMemo(() => {
        return [...newTokensData.data].sort((a, b) => {
            const aValue = getNestedValue(a, newTokensSortConfig.key)
            const bValue = getNestedValue(b, newTokensSortConfig.key)

            if (aValue < bValue) {
                return newTokensSortConfig.direction === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return newTokensSortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
        })
    }, [newTokensData.data, newTokensSortConfig])

    return (
        <div className="scanner-tables">
            <h2>Token Scanner</h2>

            <div className="filters-container">
                <FilterPanel
                    title={'Trending Tokens filters'}
                    filters={trendingFilters}
                    onFiltersChange={setTrendingFilters}
                />
                <FilterPanel
                    title={'New Tokens filters'}
                    filters={newTokensFilters}
                    onFiltersChange={setNewTokensFilters}
                />
            </div>

            <div className="tables-container">
                <TokenTable
                    title="Trending Tokens"
                    tokens={sortedTrendingData}
                    loading={trendingData.loading}
                    error={trendingData.error}
                    onLoadMore={trendingData.loadMore}
                    sortConfig={trendingSortConfig}
                    onSort={handleTrendingSort}
                />

                <TokenTable
                    title="New Tokens"
                    tokens={sortedNewTokensData}
                    loading={newTokensData.loading}
                    error={newTokensData.error}
                    onLoadMore={newTokensData.loadMore}
                    sortConfig={newTokensSortConfig}
                    onSort={handleNewTokensSort}
                />
            </div>
        </div>
    )
}

export default ScannerTables
