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

type TopGainersLosersClientProps = {
  topGainers: TopGainersLosers[];
  topLosers: TopGainersLosers[];
};

type ActiveTab = "gainers" | "losers";

const TopGainersLosersClient = ({
  topGainers,
  topLosers,
}: TopGainersLosersClientProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("gainers");

  const coins = useMemo(() => {
    const list = activeTab === "gainers" ? topGainers : topLosers;
    return list.slice(0, 4);
  }, [activeTab, topGainers, topLosers]);

  return (
    <section id="top-gainers-losers">
      <div className="tabs-list">
        <button
          type="button"
          className="tabs-trigger"
          data-state={activeTab === "gainers" ? "active" : "inactive"}
          aria-pressed={activeTab === "gainers"}
          onClick={() => setActiveTab("gainers")}
        >
          Top Gainers
        </button>
        <button
          type="button"
          className="tabs-trigger"
          data-state={activeTab === "losers" ? "active" : "inactive"}
          aria-pressed={activeTab === "losers"}
          onClick={() => setActiveTab("losers")}
        >
          Top Losers
        </button>
      </div>
      <div className="tabs-content">
        <ul className="details-grid">
          {coins.map((coin) => {
            const isTrendingUp = coin.priceChangePercentage24h > 0;
            const imgSrc = normalizeImageSrc(coin.image);
            return (
              <li key={coin.id}>
                <Link href={`/coins/${coin.id}`} className="coin-link">
                  <div className="coin-header">
                    <Image
                      src={imgSrc}
                      alt={coin.name}
                      width={44}
                      height={44}
                      className="coin-image"
                    />
                    <div className="coin-info">
                      <p className="name">{coin.name}</p>
                      <p className="symbol">{coin.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="price-row">
                    <p className="price">{formatCurrency(coin.price)}</p>
                    <span
                      className={cn(
                        "change",
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
    </section>
  );
};

export default TopGainersLosersClient;
