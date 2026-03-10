import React from "react";
import { fetcher } from "@/lib/coingecko.actions";
import TopGainersLosersClient from "@/components/home/TopGainersLosersClient";
import { TopGainersLosersFallback } from "@/components/home/fallback";

type TopGainersLosersApiResponse = {
  top_gainers: TopGainersLosersResponse[];
  top_losers: TopGainersLosersResponse[];
};

const mapCoin = (coin: TopGainersLosersResponse): TopGainersLosers => ({
  id: coin.id,
  name: coin.name,
  symbol: coin.symbol,
  image: coin.image,
  price: coin.usd,
  priceChangePercentage24h: coin.usd_24h_change,
});

const TopGainersLosers = async () => {
  let data: TopGainersLosersApiResponse | null = null;

  try {
    data = await fetcher<TopGainersLosersApiResponse>(
      "/coins/top_gainers_losers",
      { vs_currency: "usd" },
      120,
    );
  } catch (error) {
    console.error("TopGainersLosers fetch failed:", error);
    return <TopGainersLosersFallback />;
  }

  if (!data) return <TopGainersLosersFallback />;

  const topGainers = (data.top_gainers ?? []).map(mapCoin);
  const topLosers = (data.top_losers ?? []).map(mapCoin);

  return (
    <TopGainersLosersClient topGainers={topGainers} topLosers={topLosers} />
  );
};

export default TopGainersLosers;
