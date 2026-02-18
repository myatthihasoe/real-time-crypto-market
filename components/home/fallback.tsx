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
          rowKey={(coin) => coin.item.id}
          tableClassName="trending-coins-table"
          headerCellClassName="py-3"
          bodyCellClassName="py-2"
        />
      </div>
    </div>
  );
}

// New: Categories fallback skeleton
export function CategoriesFallback() {
  // Create simple skeleton rows shaped similarly to Category used in DataTable
  const categorySkeletonRows = Array.from({ length: 6 }).map((_, i) => ({
    name: "",
    top_3_coins: ["", "", ""],
    market_cap_change_24h: 0,
    market_cap: 0,
    volume_24h: 0,
  }));

  const columns = [
    {
      header: "Categories",
      cellClassName: "category-cell",
      cell: () => <div className="category-line skeleton" />,
    },
    {
      header: "Top Gainers",
      cellClassName: "top-gainers-cell",
      cell: () => (
        <div className="top-gainers-skeleton flex gap-2 items-center">
          <div className="avatar-skeleton skeleton h-7 w-7 rounded-full" />
          <div className="avatar-skeleton skeleton h-7 w-7 rounded-full" />
          <div className="avatar-skeleton skeleton h-7 w-7 rounded-full" />
        </div>
      ),
    },
    {
      header: "24h Change",
      cellClassName: "change-header-cell",
      cell: () => (
        <div className="change-cell">
          <div className="change-line skeleton w-16" />
        </div>
      ),
    },
    {
      header: "Market Cap",
      cellClassName: "market-cap-cell",
      cell: () => <div className="marketcap-line skeleton w-24" />,
    },
    {
      header: "24h Volume",
      cellClassName: "volume-cell",
      cell: () => <div className="volume-line skeleton w-24" />,
    },
  ];

  return (
    <div id="categories-fallback">
      <h4>Top Categories</h4>
      <div id="categories">
        <DataTable
          columns={columns}
          data={categorySkeletonRows}
          rowKey={(_, index) => index}
          tableClassName="mt-3"
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