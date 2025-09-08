import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TokenData } from '../types/TokenData'
import { createColumns } from './Columns'

const LoadingRow = () => {
    return (
        <div className="token-row loading-row">
            <div className="token-cell loading-content">
                <div className="loading-spinner"></div>
                Loading more tokens...
            </div>
        </div>
    )
}

export const TokenTable: React.FC<{
    title: string
    tokens: TokenData[]
    loading: boolean
    error: string | null
    onLoadMore: () => void
    sortConfig: { key: string; direction: 'asc' | 'desc' }
    onSort: (key: string) => void
}> = ({ title, tokens, loading, error, onLoadMore, sortConfig, onSort }) => {
    const [sorting, setSorting] = useState<SortingState>([
        { id: sortConfig.key, desc: sortConfig.direction === 'desc' },
    ])

    const parentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setSorting([{ id: sortConfig.key, desc: sortConfig.direction === 'desc' }])
    }, [sortConfig])

    const handleSortChange = useCallback(
        (newSorting: SortingState) => {
            setSorting(newSorting)
            if (newSorting.length > 0) {
                const { id } = newSorting[0]
                onSort(id)
            }
        },
        [onSort]
    )

    const columns = useMemo(() => createColumns(), [])

    const table = useReactTable({
        data: tokens,
        columns,
        state: {
            sorting,
        },
        onSortingChange: handleSortChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: false,
    })

    const { rows } = table.getRowModel()
    const rowVirtualizer = useVirtualizer({
        count: rows.length + (loading && tokens.length > 0 ? 1 : 0),
        getScrollElement: () => parentRef.current,
        estimateSize: () => 60,
        overscan: 10,
    })

    useEffect(() => {
        const handleScroll = () => {
            if (!parentRef.current) return

            const { scrollTop, scrollHeight, clientHeight } = parentRef.current
            const scrollBottom = scrollHeight - scrollTop - clientHeight

            if (scrollBottom < 100 && !loading) {
                onLoadMore()
            }
        }

        const scrollElement = parentRef.current
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll, { passive: true })
            return () => scrollElement.removeEventListener('scroll', handleScroll)
        }
    }, [loading, onLoadMore])

    const virtualItems = rowVirtualizer.getVirtualItems()
    const totalSize = rowVirtualizer.getTotalSize()

    if (error) {
        return (
            <div className="token-table">
                <h3>{title}</h3>
                <div className="error-message">Error: {error}</div>
            </div>
        )
    }

    return (
        <div className="token-table">
            <div className="token-table-content">
                <h3>{title}</h3>
                <div className="table-header">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <div key={headerGroup.id} className="table-header-row">
                            {headerGroup.headers.map((header) => (
                                <div
                                    key={header.id}
                                    className={`table-header-cell table-header-${header.id}`}
                                    style={{ width: header.getSize() }}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {header.id === 'tokenName' ? (
                                        <>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{
                                                asc: ' ↑',
                                                desc: ' ↓',
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </>
                                    ) : (
                                        <>
                                            {{
                                                asc: '↑ ',
                                                desc: '↓ ',
                                            }[header.column.getIsSorted() as string] ?? null}
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div ref={parentRef} className="table-body" style={{ height: '400px', overflow: 'auto' }}>
                    <div
                        style={{
                            height: `${totalSize}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {virtualItems.map((virtualItem) => {
                            const index = virtualItem.index

                            if (index >= rows.length) {
                                return (
                                    <div
                                        key={virtualItem.key}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualItem.size}px`,
                                            transform: `translateY(${virtualItem.start}px)`,
                                        }}
                                        className="token-row loading-row"
                                    >
                                        <div className="loading-content">
                                            <div className="loading-spinner"></div>
                                            Loading more tokens...
                                        </div>
                                    </div>
                                )
                            }

                            const row = rows[index]
                            return (
                                <div
                                    key={virtualItem.key}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualItem.size}px`,
                                        transform: `translateY(${virtualItem.start}px)`,
                                    }}
                                    className="token-row"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <div
                                            key={cell.id}
                                            className="token-cell"
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                    {loading && tokens.length === 0 && <LoadingRow />}
                </div>
            </div>
        </div>
    )
}
