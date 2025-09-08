import type { ColumnDef } from '@tanstack/react-table'
import type { TokenData } from '../types/TokenData'
import {
    AgeCell,
    AuditCell,
    LiquidityCell,
    MarketCapCell,
    PriceCell,
    PriceChangeCell,
    TokenNameCell,
    TransactionsCell,
    VolumeCell,
} from './Cells'

export const createColumns = (): ColumnDef<TokenData>[] => [
    {
        accessorKey: 'tokenName',
        header: 'Token',
        cell: ({ row }) => <TokenNameCell token={row.original} />,
        size: 150,
    },
    {
        accessorKey: 'priceUsd',
        header: 'Price',
        cell: ({ row }) => <PriceCell token={row.original} />,
        size: 100,
    },
    {
        accessorKey: 'tokenCreatedTimestamp',
        header: 'Age',
        cell: ({ row }) => <AgeCell token={row.original} />,
        size: 100,
    },
    {
        accessorKey: 'volumeUsd',
        header: 'Volume',
        cell: ({ row }) => <VolumeCell token={row.original} />,
        size: 120,
    },
    {
        accessorKey: 'transactions',
        header: 'Buys/Sells',
        cell: ({ row }) => <TransactionsCell token={row.original} />,
        size: 100,
    },
    {
        accessorKey: 'mcap',
        header: 'Marketcap',
        cell: ({ row }) => <MarketCapCell token={row.original} />,
        size: 120,
    },
    {
        accessorKey: 'liquidity.current',
        header: 'Liquidity',
        cell: ({ row }) => <LiquidityCell token={row.original} />,
        size: 110,
    },
    {
        accessorKey: 'priceChangePcs.5m',
        header: '5m',
        cell: ({ row }) => <PriceChangeCell token={row.original} colKey={'5m'} />,
        size: 80,
    },
    {
        accessorKey: 'priceChangePcs.1h',
        header: '1h',
        cell: ({ row }) => <PriceChangeCell token={row.original} colKey={'1h'} />,
        size: 80,
    },
    {
        accessorKey: 'priceChangePcs.6h',
        header: '6h',
        cell: ({ row }) => <PriceChangeCell token={row.original} colKey={'6h'}/>,
        size: 80,
    },
    {
        accessorKey: 'priceChangePcs.24h',
        header: '24h',
        cell: ({ row }) => <PriceChangeCell token={row.original} colKey={'24h'}/>,
        size: 80,
    },
    {
        accessorKey: 'audit',
        header: 'Audit',
        cell: ({ row }) => <AuditCell token={row.original} />,
        size: 120,
        enableSorting: false,
    },
]
