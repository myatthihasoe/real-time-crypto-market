import React from "react";
import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { CoinOverviewFallback } from "@/components/home/fallback";

const CoinOverview = async () => {
  let coin: CoinDetailsData | null = null;
  try {
    coin = await fetcher<CoinDetailsData>("/coins/bitcoin", {
      dex_pair_format: "symbol",
    });
  } catch (error) {
    // Log the error and/or send to telemetry. Returning a safe fallback UI so
    // the render does not throw synchronously when the API fails.
    // Replace with your telemetry/reporting client if available.

    console.error("CoinOverview fetch failed:", error);
    return <CoinOverviewFallback />;
  }

  // If coin is unexpectedly null, show fallback to avoid runtime errors.
  if (!coin) return <CoinOverviewFallback />;

  return (
    <div id="coin-overview">
      <div className="header pt-2">
        <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
        <div className="info">
          <p>
            {coin.name} / {coin.symbol.toUpperCase()}
          </p>
          <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
        </div>
      </div>
    </div>
  );
};
export default CoinOverview;
