'use client';
import {useEffect, useRef, useState} from "react";

export const useCoinGeckoWebsocket = ({
                                          coinId,
                                          poolId,
                                          liveInterval
                                      }: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
    const wsRef = useRef<WebSocket | null>(null)
    const subscribed = useRef(<Set<string>>new Set())
    const [price, setPrice] = useState<ExtendedPriceData | null>(null)
    // renamed setter to setTrades for clarity
    const [trades, setTrades] = useState<Trade[]>([])
    const [ohlcv, setOhlcv] = useState<OHLCData | null>(null)
    const [isWsReady, setIsWsReady] = useState<boolean>(false)
    const [wsUrl, setWsUrl] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/websocket-url')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch ws url');
                return res.json();
            })
            .then(data => setWsUrl(data.url))
            .catch(err => console.error('[useCoinGeckoWebsocket] Failed to fetch websocket url', err));
    }, [])

    useEffect(() => {
        // Defensive: ensure we have a valid url before opening
        if (!wsUrl) {
            console.warn('[useCoinGeckoWebsocket] NO websocket url configured')
            return
        }
        let ws: WebSocket | null = null
        try {
            ws = new WebSocket(wsUrl)
        } catch (err) {
            console.error('[useCoinGeckoWebsocket] failed to create websocket', err)
            return
        }
        wsRef.current = ws

        const safeSend = (payload: Record<string, unknown>) => {
            try {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(payload))
                } else {
                    // queueing could be implemented here; for now log
                    console.debug('[useCoinGeckoWebsocket] send requested but socket not open', payload)
                }
            } catch (err) {
                console.error('[useCoinGeckoWebsocket] failed to send payload', err, payload)
            }
        }
        const handleMessage = (event: MessageEvent) => {
            let msg: WebSocketMessage;
            try {
                msg = JSON.parse(event.data)
                // log raw message for debugging
                console.debug('[useCoinGeckoWebsocket] raw msg', msg)
            } catch (err) {
                console.log('[useCoinGeckoWebsocket] failed to parse message', err)
                return
            }

            // Helpful debug output while developing. Remove or lower log level in production.
            console.log('[useCoinGeckoWebsocket] incoming message:', msg)

            // handle ping
            if (msg.type === "ping") {
                safeSend({type: 'pong'})
                return;
            }

            // confirm subscription message structure from actioncable-style websockets
            if (msg.type === 'confirm_subscription' || msg.type === 'welcome') {
                try {
                    const identifier = JSON.parse(msg?.identifier ?? '{}')
                    if (identifier?.channel) {
                        subscribed.current.add(identifier.channel)
                        console.debug('[useCoinGeckoWebsocket] subscribed to', identifier.channel)
                    }
                } catch (err) {
                    console.warn('[useCoinGeckoWebsocket] could not parse confirm_subscription identifier', err)
                }
            }

            // C1 price message
            if (msg.c === "C1" || msg.channel === 'CGSimplePrice') {
                setPrice({
                    usd: msg.p ?? 0,
                    coin: msg.i ?? coinId,
                    price: msg.p ?? 0,
                    change24h: msg.pp,
                    marketCap: msg.m,
                    volume24h: msg.v,
                    timestamp: msg.t,
                })
            }

            // Onchain trade message (G2) — create a defensive mapping and log raw message to inspect structure
            // CoinGecko G2 messages can sometimes arrive with different property names; try multiple fallbacks
            if (msg.c === "G2" || msg.channel === 'OnchainTrade' || msg.channel === 'OnchainTrades') {
                const newTrade: Trade = {
                    price: Number(msg.pu ?? msg.p ?? 0),
                    value: Number(msg.vo ?? msg.v ?? 0),
                    timestamp: Number(msg.t ?? Date.now()),
                    type: (msg.ty ?? msg.type ?? (msg.type === 'sell' ? 's' : 'b')) as Trade['type'],
                    amount: Number(msg.to ?? 0),
                }
                console.log('[useCoinGeckoWebsocket] parsed trade', newTrade)
                // prepend and keep up to 7 recent trades
                setTrades((prev) => [newTrade, ...prev].slice(0, 7))
            }

            // OnChainOHLCV Websocket Coingecko
            if (msg.ch === "G3" || msg.channel === 'OnchainOHLCV') {
                const timestamp = Number(msg.t ?? 0)
                const candle: OHLCData = [timestamp, Number(msg.o ?? 0), Number(msg.h ?? 0), Number(msg.l ?? 0), Number(msg.c ?? 0)]
                setOhlcv(candle)
            }
        };
        ws.onopen = () => {
            setIsWsReady(true)
            console.info('[useCoinGeckoWebsocket] websocket opened', wsUrl)
        }
        ws.onmessage = handleMessage;
        ws.onclose = (ev) => {
            setIsWsReady(false)
            console.info('[useCoinGeckoWebsocket] websocket closed', ev)
        }
        ws.onerror = (err) => {
            console.error('[useCoinGeckoWebsocket] websocket error', err)
        }
        return () => {
            try {
                ws?.close()
            } catch (err) {
                console.warn('[useCoinGeckoWebsocket] error closing socket', err)
            }
        }
    }, [wsUrl])

    useEffect(() => {
        if (!isWsReady) return
        const ws = wsRef.current;
        if (!ws) return;

        const safeSend = (payload: Record<string, unknown>) => {
            try {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(payload))
                } else {
                    console.debug('[useCoinGeckoWebsocket] send requested but socket not open', payload)
                }
            } catch (err) {
                console.error('[useCoinGeckoWebsocket] failed to send payload', err, payload)
            }
        }
        const unsubscribeAll = () => {
            subscribed.current.forEach((channel) => {
                // correct command name to 'unsubscribe'
                safeSend({
                    command: 'unsubscribe',
                    identifier: JSON.stringify({channel})
                })
            })
            subscribed.current.clear()
        }
        const subscribe = (channel: string, data?: Record<string, unknown>) => {

            if (subscribed.current.has(channel)) return;
            safeSend({command: 'subscribe', identifier: JSON.stringify({channel})})
            console.debug('[useCoinGeckoWebsocket] subscribe requested for', channel, data)
            if (data) {
                safeSend({
                    command: 'message',
                    identifier: JSON.stringify({channel}),
                    data: JSON.stringify(data)
                })
            }
        }
        setPrice(null)
        setTrades([])
        setOhlcv(null)
        unsubscribeAll()
        subscribe("CGSimplePrice", {coin_id: [coinId], action: 'set_tokens'})

        if (poolId) {
            const poolAddress = poolId.replace('_', ':')
            if (poolAddress) {
                subscribe('OnchainTrade', {
                    'network_id:pool_address': [poolAddress],
                    action: 'set_pools'
                })
                subscribe('OnchainOHLCV', {
                    'network_id:pool_address': [poolAddress],
                    interval: liveInterval,
                    action: 'set_pools'
                })
            }
        }
    }, [coinId, poolId, isWsReady, liveInterval]);
    return {
        price,
        trades,
        ohlcv,
        isConnected: isWsReady
    }
}