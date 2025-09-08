import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { IncomingWebSocketMessage } from '../types/test-task-types'

export const useWebSocket = (url: string, onMessage: (message: IncomingWebSocketMessage) => void) => {
    const [ws, setWs] = useState<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(url)

            ws.onopen = () => {
                console.log('WebSocket connected')
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current)
                    reconnectTimeoutRef.current = null
                }
                setWs(ws)
            }

            ws.onmessage = (event) => {
                try {
                    const message: IncomingWebSocketMessage = JSON.parse(event.data)
                    onMessage(message)
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error)
                }
            }

            ws.onclose = () => {
                console.log('WebSocket disconnected, attempting to reconnect...')
                if (!reconnectTimeoutRef.current) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectTimeoutRef.current = null
                        connect()
                    }, 3000)
                }
            }

            ws.onerror = (error) => {
                console.error('WebSocket error:', error)
            }

            setWs(ws)
        } catch (error) {
            console.error('Error creating WebSocket connection:', error)
        }
    }, [url, onMessage])

    const isConnected = useMemo(() => {
        return ws && ws.readyState === WebSocket.OPEN
    }, [ws])

    const send = useCallback(
        (message: any) => {
            if (isConnected) {
                ws.send(JSON.stringify(message))
            }
        },
        [ws]
    )

    const disconnect = useCallback(() => {
        if (ws) {
            ws.close()
            setWs(null)
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            connect()
        })
        return () => disconnect()
    }, [connect, disconnect])

    return { send, disconnect, isConnected }
}
