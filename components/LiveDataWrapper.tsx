'use client';
import {Separator} from "@/components/ui/separator"
import CandlestickChart from "@/components/CandlestickChart"
import {useCoinGeckoWebsocket} from "@/hooks/useCoinGeckoWebsocket";
import {formatCurrency, timeAgo} from "@/lib/utils";
import DataTable from "@/components/DataTable";
import {useState} from "react";
import CoinHeader from "@/components/CoinHeader";

const LiveDataWrapper = ({children, coinId, poolId, coin, coinOHLCData}: LiveDataProps) => {
    const [liveInterval, setLiveInterval] = useState<'1s' | '1m'>('1s')
    const {trades, ohlcv, price} = useCoinGeckoWebsocket({coinId, poolId, liveInterval})
    console.log("[LiveDataWrapper] price",price)


    // debug - log trades to browser console so we can inspect incoming data
    console.log('[LiveDataWrapper] trades', trades)
    const tradeColumns: DataTableColumn<Trade>[] = [
        {
            header: "Price",
            cellClassName: "price-cell",
            cell: (trade) => (trade.price ? formatCurrency(trade.price) : "-"),
        },
        {
            header: "Amount",
            cellClassName: "amount-cell",
            cell: (trade) => trade.amount?.toFixed(4) ?? "-",
        },
        {
            header: "Value",
            cellClassName: "value-cell",
            cell: (trade) => (trade.value ? formatCurrency(trade.value) : "-"),
        },
        {
            header: "Buy/Sell",
            cellClassName: "type-cell",
            cell: (trade) => (
                <span
                    className={trade.type === "b" ? "text-green-500" : "text-red-500"}
                >
                    {trade.type === "b" ? "Buy" : "Sell"}
                </span>
            ),
        },
        {
            header: "Time",
            cellClassName: "time-cell",
            cell: (trade) => (trade.timestamp ? timeAgo(trade.timestamp) : "-"),
        },
    ]
    return (
        <section id="live-data-wrapper">
            <CoinHeader name={coin.name}
                        image={coin.image.large}
                        livePrice={price?.usd ?? coin.market_data.current_price.usd}
                        livePriceChangePercentage24h={price?.change24h??coin.market_data.price_change_percentage_24h_in_currency.usd}
                        priceChangePercentage30d={coin.market_data.price_change_percentage_30d_in_currency.usd}
                        priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
            />
            <Separator className="divider"/>
            <div className="trend">
                <CandlestickChart coinId={coinId} data={coinOHLCData} liveOhlcv={ohlcv} mode="live"
                                  initialPeriod="daily" liveInterval={liveInterval} setLiveInterval={setLiveInterval}>
                    <h4>Trend Overview</h4>
                </CandlestickChart>
            </div>
            <Separator className="divider"/>
            {/*/!* Debug panel to help diagnose empty trades *!/*/}
            {/*<div style={{marginBottom: 12}}>*/}
            {/*    <strong>Recent Trades Debug</strong>*/}
            {/*    <div>Count: {trades?.length ?? 0}</div>*/}
            {/*    {(!trades || trades.length === 0) && (*/}
            {/*        <pre style={{whiteSpace: 'pre-wrap', fontSize: 12, color: '#bbb'}}>*/}
            {/*            {JSON.stringify(trades, null, 2)}*/}
            {/*        </pre>*/}
            {/*    )}*/}
            {/*</div>*/}
            {tradeColumns && (
                <div className="trades">
                    <h4>Recent Trades</h4>

                    <DataTable columns={tradeColumns} data={trades} rowKey={(_, index) => index}
                               tableClassName="trades-table"/>

                </div>
            )}
        </section>
    )
}

export default LiveDataWrapper