"use client";

import React from "react";
import DataTable from "@/components/DataTable";

// Simple skeleton data structure matching TrendingCoin shape enough for DataTable
const skeletonRows = Array.from({ length: 6 }).map((_, i) => ({
  item: {
    id: `skeleton-${i}`,
    name: "",
    large: "",
    data: {
      price: 0,
      price_change_percentage_24h: { usd: 0 },
    },
  },
}));

export function CoinOverviewFallback() {
  return (
    <div id="coin-overview-fallback">
      <div className="header pt-2">
        <div className="header-image skeleton" />
        <div className="info">
          <div className="header-line-lg skeleton" />
          <div className="header-line-sm skeleton" />
        </div>
      </div>
      <div className="chart mt-4">
        <div className="chart-skeleton skeleton" />
      </div>
    </div>
  );
}

export function TrendingCoinsFallback() {
  const columns = [
    {
      header: "Name",
      cellClassName: "name-cell",
      cell: () => (
        <div className="name-link">
          <div className="name-image skeleton" />
          <div className="name-line skeleton" />
        </div>
      ),
    },
    {
      header: "24hr Change",
      cellClassName: "change-cell",
      cell: () => (
        <div className="change-cell">
          <div className="change-line skeleton" />
        </div>
      ),
    },
    {
      header: "Price",
      cellClassName: "price-cell",
      cell: () => <div className="price-line skeleton" />,
    },
  ];

  return (
    <div id="trending-coins-fallback">
      <h4>Trending Coins</h4>
      <div id="trending-coins">
        <DataTable
          data={skeletonRows}
          columns={columns}
          rowKey={(coin: any) => coin.item.id}
          tableClassName="trending-coins-table"
          headerCellClassName="py-3"
          bodyCellClassName="py-2"
        />
      </div>
    </div>
  );
}

// export default {
//   CoinOverviewFallback,
//   TrendingCoinsFallback,
// };
