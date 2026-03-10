"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  cn,
  formatCurrency,
  formatPercentage,
  normalizeImageSrc,
} from "@/lib/utils";

type TopGainersLosersDetailsProps = {
  topGainers: TopGainersLosers[];
  topLosers: TopGainersLosers[];
};

type ActiveTab = "gainers" | "losers";

const TopGainersLosersDetails = ({
  topGainers,
  topLosers,
}: TopGainersLosersDetailsProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("gainers");

  const coins = useMemo(() => {
    const list = activeTab === "gainers" ? topGainers : topLosers;
    return list.slice(0, 4);
  }, [activeTab, topGainers, topLosers]);

  return (
    <div className="details">
      <div className="details-tabs">
        <button
          type="button"
          className="details-tab"
          data-state={activeTab === "gainers" ? "active" : "inactive"}
          aria-pressed={activeTab === "gainers"}
          onClick={() => setActiveTab("gainers")}
        >
          Top Gainers
        </button>
        <button
          type="button"
          className="details-tab"
          data-state={activeTab === "losers" ? "active" : "inactive"}
          aria-pressed={activeTab === "losers"}
          onClick={() => setActiveTab("losers")}
        >
          Top Losers
        </button>
      </div>
      <ul className="details-grid">
        {coins.map((coin) => {
          const isTrendingUp = coin.priceChangePercentage24h > 0;
          const imgSrc = normalizeImageSrc(coin.image);
          return (
            <li key={coin.id}>
              <Link href={`/coins/${coin.id}`} className="details-coin-link">
                <div className="details-coin-header">
                  <Image
                    src={imgSrc}
                    alt={coin.name}
                    width={40}
                    height={40}
                    className="details-coin-image"
                  />
                  <div className="details-coin-info">
                    <p className="label">{coin.name}</p>
                    <p className="details-coin-symbol">
                      {coin.symbol.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="details-coin-price-row">
                  <p className="details-coin-price">
                    {formatCurrency(coin.price)}
                  </p>
                  <span
                    className={cn(
                      "details-coin-change",
                      isTrendingUp ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {isTrendingUp ? (
                      <TrendingUp width={16} height={16} />
                    ) : (
                      <TrendingDown width={16} height={16} />
                    )}
                    {formatPercentage(coin.priceChangePercentage24h)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TopGainersLosersDetails;
