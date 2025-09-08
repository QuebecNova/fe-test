import { useState } from 'react'
import type { GetScannerResultParams, SupportedChainName } from '../types/test-task-types'

export const FilterPanel: React.FC<{
    filters: GetScannerResultParams
    title: React.ReactElement | string
    onFiltersChange: (filters: GetScannerResultParams) => void
}> = ({ title, filters, onFiltersChange }) => {
    const [localFilters, setLocalFilters] = useState(filters)

    const handleFilterChange = (key: keyof GetScannerResultParams, value: any) => {
        const newFilters = { ...localFilters, [key]: value }
        setLocalFilters(newFilters)
        onFiltersChange(newFilters)
    }

    const handleChainChange = (chain: SupportedChainName | 'ALL') => {
        handleFilterChange('chain', chain === 'ALL' ? null : chain)
    }

    return (
        <div className="filter-panel">
            <h4>{title}</h4>
            <div className="filter-group">
                <label>Chain:</label>
                <select
                    value={localFilters.chain || 'ALL'}
                    onChange={(e) => handleChainChange(e.target.value as SupportedChainName | 'ALL')}
                >
                    <option value="ALL">All Chains</option>
                    <option value="ETH">Ethereum</option>
                    <option value="SOL">Solana</option>
                    <option value="BASE">Base</option>
                    <option value="BSC">BSC</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Min Volume (24h):</label>
                <input
                    type="number"
                    value={localFilters.minVol24H || ''}
                    onChange={(e) => handleFilterChange('minVol24H', e.target.value ? Number(e.target.value) : null)}
                    placeholder="Min volume"
                />
            </div>

            <div className="filter-group">
                <label>Max Age (hours):</label>
                <input
                    type="number"
                    value={localFilters.maxAge ? localFilters.maxAge / 3600 : ''}
                    onChange={(e) =>
                        handleFilterChange('maxAge', e.target.value ? Number(e.target.value) * 3600 : null)
                    }
                    placeholder="Max age in hours"
                />
            </div>

            <div className="filter-group">
                <label>Min Market Cap:</label>
                <input
                    type="number"
                    value={localFilters.minLiq || ''}
                    onChange={(e) => handleFilterChange('minLiq', e.target.value ? Number(e.target.value) : null)}
                    placeholder="Min market cap"
                />
            </div>

            <div className="filter-group">
                <label>
                    <input
                        type="checkbox"
                        checked={localFilters.isNotHP || false}
                        onChange={(e) => handleFilterChange('isNotHP', e.target.checked)}
                    />
                    Exclude Honeypots
                </label>
            </div>
        </div>
    )
}
