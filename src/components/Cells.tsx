import React, { useEffect, useState } from 'react'
import { formatAge, formatPrice } from '../helpers/format'
import { usePrev } from '../hooks/usePrev'
import type { TokenData } from '../types/TokenData'
import { CheckIcon } from './icons/Check'
import { CrossIcon } from './icons/Cross'

export const PriceCell = React.memo(({ token }: { token: TokenData }) => {
    const [changeType, setChangeType] = useState<'up' | 'down' | null>(null)
    const prevPrice = usePrev(token.priceUsd)

    useEffect(() => {
        if (prevPrice && token.priceUsd !== prevPrice) {
            const change = token.priceUsd > prevPrice ? 'up' : 'down'
            setChangeType(change)
            setTimeout(() => setChangeType(null), 1000)
        }
    }, [token.priceUsd])

    return <div className={`col-price ${changeType}`}>{formatPrice(token.priceUsd)}</div>
})

export const MarketCapCell = React.memo(({ token }: { token: TokenData }) => {
    const [changeType, setChangeType] = useState<'up' | 'down' | null>(null)
    const prevMcap = usePrev(token.mcap)

    useEffect(() => {
        if (prevMcap && token.mcap !== prevMcap) {
            const change = token.mcap > prevMcap ? 'up' : 'down'
            setChangeType(change)
            setTimeout(() => setChangeType(null), 1000)
        }
    }, [token.mcap])

    return <div className={`col-mcap ${changeType}`}>{formatPrice(token.mcap)}</div>
})

export const VolumeCell = React.memo(({ token }: { token: TokenData }) => {
    const [changeType, setChangeType] = useState<'up' | 'down' | null>(null)
    const prevVolume = usePrev(token.volumeUsd)

    useEffect(() => {
        if (prevVolume && token.volumeUsd !== prevVolume) {
            const change = token.volumeUsd > prevVolume ? 'up' : 'down'
            setChangeType(change)
            setTimeout(() => setChangeType(null), 1000)
        }
    }, [token.volumeUsd])

    return <div className={`col-volume ${changeType}`}>{formatPrice(token.volumeUsd)}</div>
})

export const PriceChangeCell = React.memo(
    ({ token, colKey }: { token: TokenData; colKey: keyof TokenData['priceChangePcs'] }) => {
        const [changeType, setChangeType] = useState<'up' | 'down' | null>(null)
        const prevChange = usePrev(token.priceChangePcs[colKey])

        useEffect(() => {
            if (prevChange && token.priceChangePcs[colKey] !== prevChange) {
                const change = token.priceChangePcs[colKey] > prevChange ? 'up' : 'down'
                setChangeType(change)
                setTimeout(() => setChangeType(null), 1000)
            }
        }, [token.priceChangePcs[colKey]])

        return (
            <div className={`col-change ${changeType}`}>
                <span
                    className={
                        token.priceChangePcs[colKey] === 0
                            ? 'faded'
                            : token.priceChangePcs[colKey] >= 0
                              ? 'positive'
                              : 'negative'
                    }
                >
                    {token.priceChangePcs[colKey].toFixed(0)}%
                </span>
            </div>
        )
    }
)

export const TransactionsCell = React.memo(({ token }: { token: TokenData }) => {
    const [buyChangeType, setBuyChangeType] = useState<'up' | 'down' | null>(null)
    const [sellChangeType, setSellChangeType] = useState<'up' | 'down' | null>(null)
    const prevBuys = usePrev(token.transactions.buys)
    const prevSells = usePrev(token.transactions.sells)

    useEffect(() => {
        if (prevBuys && token.transactions.buys !== prevBuys) {
            const change = token.transactions.buys > prevBuys ? 'up' : 'down'
            setBuyChangeType(change)
            setTimeout(() => setBuyChangeType(null), 1000)
        }

        if (prevSells && token.transactions.sells !== prevSells) {
            const change = token.transactions.sells > prevSells ? 'up' : 'down'
            setSellChangeType(change)
            setTimeout(() => setSellChangeType(null), 1000)
        }
    }, [token.transactions.buys, token.transactions.sells])

    return (
        <div className="col-transactions">
            <span className={`buy-count ${buyChangeType}`}>{formatPrice(token.transactions.buys)}</span>
            <span className="divider"> / </span>
            <span className={`sell-count ${sellChangeType}`}>{formatPrice(token.transactions.sells)}</span>
        </div>
    )
})

export const TokenNameCell = React.memo(({ token }: { token: TokenData }) => (
    <div className="col-token">
        {token.tokenSymbol} / <span className="faded">{token.chain}</span>
    </div>
))

export const AgeCell = React.memo(({ token }: { token: TokenData }) => (
    <div className="col-age">{formatAge(new Date(token.tokenCreatedTimestamp))}</div>
))

export const LiquidityCell = React.memo(({ token }: { token: TokenData }) => (
    <div className="col-liquidity">{formatPrice(token.liquidity.current)}</div>
))

export const AuditCell = React.memo(({ token }: { token: TokenData }) => {
    return (
        <div className="col-audit">
            <div className="audit-icon" title={token.audit.mintable ? 'Mintable' : 'Renounced'}>
                {token.audit.mintable ? <CheckIcon /> : <CrossIcon />}
                <span>Mintable</span>
            </div>

            <div className="audit-icon" title={token.audit.freezable ? 'Freezable' : 'Renounced'}>
                {token.audit.freezable ? <CheckIcon /> : <CrossIcon />}
                <span>Freezable</span>
            </div>

            <div className="audit-icon" title={token.audit.honeypot ? 'Honeypot' : 'Not Honeypot'}>
                {token.audit.honeypot ? <CheckIcon /> : <CrossIcon />}
                <span>Honeypot</span>
            </div>

            <div
                className="audit-icon"
                title={token.audit.contractVerified ? 'Contract Verified' : 'Contract Not Verified'}
            >
                {token.audit.contractVerified ? <CheckIcon /> : <CrossIcon />}
                <span>Verified</span>
            </div>
        </div>
    )
})
