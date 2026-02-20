import {useEffect, useRef, useState} from "react";
import {Message} from "postcss";
import {channel} from "node:diagnostics_channel";

const WS_BASE = `${process.env.NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL}?x_cg_pro_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`;

export const useCoinGeckoWebsocket = ({
                                          coinId,
                                          poolId,
                                          liveInterval
                                      }: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
    const wsRef = useRef<WebSocket | null>(null)
    const subscribed = useRef(<Set<string>>new Set())
    const [price, setPrice] = useState<ExtendedPriceData | null>(null)
    const [trades, setTrade] = useState<Trade[]>([])
    const [ohlcv, setOhlcv] = useState<OHLCData | null>(null)
    const [isWsReady, setIsWsReady] = useState<boolean>(false)

    useEffect(() => {
        const ws = new WebSocket(WS_BASE)
        wsRef.current = ws

        const send = (payload: Record<string, unknown>) => ws.send(JSON.stringify(payload))
        const handleMessage = (event: Message) => {
            const msg: WebSocketMessage = JSON.parse(event.data)
            //CGSimplePrice Websocket Coingecko
            if (msg.type === "ping") {
                send({type: 'ping'})
                return;
            }
            if (msg.type === 'confirm_subscription') {
                const {channel} = JSON.parse(msg?.identifier ?? '')
                subscribed.current.add(channel)
            }
            if (msg.c === "C1") {
                setPrice({
                    usd: msg.p ?? 0,
                    coin: msg.i,
                    price: msg.p,
                    change24h: msg.pp,
                    marketCap: msg.m,
                    volume24h: msg.v,
                    timestamp: msg.t,
                })
            }
            if (msg.c === "G2") {
                const newTrade: Trade = {
                    price: msg.pu,
                    value: msg.vo,
                    timestamp: msg.t ?? 0,
                    type: msg.ty,
                    amount: msg.to,
                }
                setTrade((prev) => [newTrade, ...prev].slice(0, 7))
            }

            //OnChainOHLCV Websocket Coingecko
            if (msg.ch === "G3") {
                const timestamp = msg.t ?? 0
                const candle: OHLCData = [timestamp, Number(msg.o ?? 0), Number(msg.h ?? 0), Number(msg.l ?? 0), Number(msg.c ?? 0)]
                setOhlcv(candle)
            }
        };
        ws.onopen = () => setIsWsReady(true)
        ws.onmessage = handleMessage;
        ws.onclose = () => setIsWsReady(false)
        return () => ws.close()
    }, [])

    useEffect(() => {
        if (!isWsReady) return
        const ws = wsRef.current;
        if (!ws) return;
        const send = (payload: Record<string, unknown>) => ws.send(JSON.stringify(payload))
        const unsubscribeAll = () => {
            subscribed.current.forEach((channel) => {
                send({
                    command: 'unscribe',
                    identifier: JSON.stringify({channel})
                })
            })
            subscribed.current.clear()
        }
        const subscribe = (channel: string, data?: Record<string, unknown>) => {

            if (subscribed.current.has(channel)) return;
            send({command: 'subscribe', identifier: JSON.stringify({channel})})
            if (data) {
                send({
                    command: 'message',
                    identifier: JSON.stringify({channel}),
                    data: JSON.stringify(data)
                })
            }
        }
        queueMicrotask(() => {
            setPrice(null);
            setTrade([])
            setOhlcv(null)

            unsubscribeAll()
            subscribe("CGSimplePrice", {coin_id: [coinId], action: 'set_tokens'})
        })
        const poolAddress = poolId.replace('_', ':')
        if (poolAddress) {
            subscribe('OnchainTrade', {
                'network_id:pool_address': [poolAddress],
                action: 'set_pools'
            })
            subscribe('OnchainOHLCV', {
                'network_id:pool_address': [poolAddress],
                liveInterval: liveInterval,
                action: 'set_pools'
            })
        }
    }, [coinId, poolId, isWsReady, liveInterval]);
    return {
        price,
        trades,
        ohlcv,
        isConnected: isWsReady
    }
}