export const formatPrice = (price: number, decimals: number = 4): string => {
    if (price === 0) return '0'
    if (price < 0.000001) return '<0.000001'

    if (price < 0.001) {
        return price.toFixed(6)
    }

    if (price < 1) {
        return price.toFixed(decimals)
    }

    if (price >= 1000000000) {
        return `$${(price / 1000000000).toFixed(2)}B`
    }
    if (price >= 1000000) {
        return `$${(price / 1000000).toFixed(2)}M`
    }
    if (price >= 1000) {
        return `$${(price / 1000).toFixed(2)}K`
    }

    return `$${price.toFixed(decimals)}`
}

export const formatAge = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 0) {
        return 'now'
    }

    if (diffInSeconds < 60) {
        return `${diffInSeconds}s`
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
        return `${diffInHours}h`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
        return `${diffInDays}d`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
        return `${diffInMonths}M`
    }

    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears}Y`
}
