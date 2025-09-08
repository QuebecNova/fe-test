import { useCallback, useEffect, useRef, useState } from 'react'
import { convertToTokenData } from '../helpers/convertToTokenData'
import type { GetScannerResultParams, ScannerApiResponse } from '../types/test-task-types'
import type { TokenData } from '../types/TokenData'

export const useScannerData = (filters: GetScannerResultParams) => {
    const [data, setData] = useState<TokenData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const dataRef = useRef(data)

    useEffect(() => {
        dataRef.current = data
    }, [data])

    const fetchData = useCallback(
        async (pageNum: number, append: boolean = false) => {
            try {
                setLoading(true)
                const params = new URLSearchParams()

                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        if (Array.isArray(value)) {
                            value.forEach((v) => params.append(key, v.toString()))
                        } else {
                            params.append(key, value.toString())
                        }
                    }
                })

                params.append('page', pageNum.toString())
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scanner?${params}`)

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

                const apiResponse: ScannerApiResponse = await response.json()
                const newData = apiResponse.pairs.map(convertToTokenData)

                setData((prev) => (append ? [...prev, ...newData] : newData))
                setHasMore(apiResponse.pairs.length > 0)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        },
        [filters]
    )

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchData(nextPage, true)
        }
    }, [loading, hasMore, page, fetchData])

    const refresh = useCallback(() => {
        setPage(1)
        fetchData(1, false)
    }, [fetchData])

    const updateData = useCallback((updater: (prevData: TokenData[]) => TokenData[]) => {
        setData(updater)
    }, [])

    const updateTokenData = useCallback((tokenId: string, updates: Partial<TokenData>) => {
        setData((prev) => {
            const tokenIndex = prev.findIndex((t) => t.id === tokenId)
            if (tokenIndex === -1) return prev

            const currentToken = prev[tokenIndex]
            const updatedToken = { ...currentToken, ...updates }

            if (JSON.stringify(currentToken) === JSON.stringify(updatedToken)) {
                return prev
            }

            return [...prev.slice(0, tokenIndex), updatedToken, ...prev.slice(tokenIndex + 1)]
        })
    }, [])

    const getTokenById = useCallback(
        (id: string) => {
            return data.find((token) => token.id === id)
        },
        [data]
    )

    useEffect(() => {
        refresh()
    }, [refresh])

    return {
        data,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        updateTokenData,
        updateData,
        getTokenById,
        getCurrentData: useCallback(() => dataRef.current, []),
    }
}
