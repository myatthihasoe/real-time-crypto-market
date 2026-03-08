"use client";
import {useEffect, useRef, useState, useTransition} from "react";
import {
    getCandlestickConfig,
    getChartConfig, LIVE_INTERVAL_BUTTONS,
    PERIOD_BUTTONS,
    PERIOD_CONFIG,
} from "@/constants";
import {
    CandlestickSeries,
    createChart,
    IChartApi,
    ISeriesApi,
} from "lightweight-charts";
import {fetcher} from "@/lib/coingecko.actions";
import {convertOHLCData} from "@/lib/utils";
import {setInterval} from "node:timers";

const CandlestickChart = ({
                              children,
                              data,
                              coinId,
                              height = 360,
                              initialPeriod = "daily",
                              liveOhlcv = null,
                              mode = 'historical',
                              liveInterval,
                              setLiveInterval
                          }: CandlestickChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const prevOhlcDataLength = useRef<number>(data?.length || 0)

    const [period, setPeriod] = useState(initialPeriod);
    const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
    const [isPending, startTransition] = useTransition();

    const fetchOhlcData = async (selectedPeriod: Period) => {
        try {
            const {days, interval} = PERIOD_CONFIG[selectedPeriod];
            const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
                vs_currency: "usd",
                days,
                interval,
                precision: "full",
            });
            startTransition(() => {
                setOhlcData(newData ?? []);
            })

        } catch (e) {
            console.error("Failed to fetch OHLC", e);
        }
    };

    // const [loading, setLoading] = useState(false);
    const handlePeriodChange = (newPeriod: Period) => {
        if (newPeriod === period) return;
        // startTransition(async () => {
        //     setPeriod(newPeriod);
        //     await fetchOhlcData(newPeriod);
        // });
        setPeriod(newPeriod)
        fetchOhlcData(newPeriod)
    };

    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container) return;
        const showTime = ["daily", "weekly", "monthly", "yearly"].includes(period);
        const chart = createChart(container, {
            ...getChartConfig(height, showTime),
            width: container.clientWidth,
        });
        const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());
        const convertedToSecond = ohlcData.map(
            (item) =>
                [
                    Math.floor(item[0] / 1000),
                    item[1],
                    item[2],
                    item[3],
                    item[4],
                ] as OHLCData,
        );

        series.setData(convertOHLCData(convertedToSecond));
        chart.timeScale().fitContent();
        chartRef.current = chart;
        candleSeriesRef.current = series;
        const observer = new ResizeObserver((entries) => {
            if (!entries.length) return;
            chart.applyOptions({width: entries[0].contentRect.width});
        });
        observer.observe(container);
        return () => {
            observer.disconnect();
            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
        };
    }, [height, period]);

    useEffect(() => {
        if (!candleSeriesRef.current) return;
        const convertedToSecond = ohlcData.map(
            (item) =>
                [
                    Math.floor(item[0] / 1000),
                    item[1],
                    item[2],
                    item[3],
                    item[4],
                ] as OHLCData,
        );
        let merge: OHLCData[];
        if (liveOhlcv) {
            const liveTimestamp = liveOhlcv[0];
            const lastHistoricalCandle = convertedToSecond[convertedToSecond.length - 1]
            if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestamp) {
                merge = [...convertedToSecond.slice(0, -1), liveOhlcv]
            } else {
                merge = [...convertedToSecond, liveOhlcv]
            }
        } else {
            merge = convertedToSecond
        }
        merge.sort((a, b) => a[0] - b[0])
        const converted = convertOHLCData(merge)

        candleSeriesRef.current.setData(converted);

        const dataChanged = prevOhlcDataLength.current !== ohlcData.length
        if (dataChanged || mode === 'historical') {
            chartRef.current?.timeScale().fitContent();
            prevOhlcDataLength.current = ohlcData.length;
        }
    }, [ohlcData, period, liveOhlcv, mode]);
    return (
        <div id="candlestick-chart">
            <div className="chart-header">
                <div className="flex-1">{children}</div>
                <div className="button-group">
                  <span className="text-sm mx-2 font-medium text-purple-100/50">
                    Period:
                  </span>
                    {PERIOD_BUTTONS.map(({value, label}) => (
                        <button
                            key={value}
                            className={
                                period === value ? "config-button-active" : "config-button"
                            }
                            onClick={() => handlePeriodChange(value)}
                            disabled={isPending}
                        >
                            {label}
                        </button>
                    ))}

                </div>
                {liveInterval && <div className="button-group">
                    <span className="text-sm mx-2 font-medium text-purple-100/50">Update Frequency:</span>
                    {LIVE_INTERVAL_BUTTONS.map(({value, label}) => (
                        <button
                            key={value}
                            className={
                                liveInterval === value ? "config-button-active" : "config-button"
                            }
                            onClick={() => setLiveInterval && setLiveInterval(value)}
                            disabled={isPending}
                        >
                            {label}
                        </button>
                    ))}
                </div>}
            </div>

            <div ref={chartContainerRef} className="chart" style={{height}}></div>
        </div>
    );
};
export default CandlestickChart;
