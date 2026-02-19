import React from "react";
import { fetcher } from "@/lib/coingecko.actions";
import DataTable from "@/components/DataTable";
import Image from "next/image";
import { cn, formatCurrency, formatPercentage, normalizeImageSrc } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

const Categories = async () => {
  const categories = await fetcher<Category[]>("/coins/categories");
  const columns: DataTableColumn<Category>[] = [
    {
      header: "Categories",
      cellClassName: "category-cell",
      cell: (category) => category.name,
    },
    {
      header: "Top Gainers",
      cellClassName: "top-gainers-cell",
      cell: (category) =>
        category.top_3_coins.map((coin) => {
          const img = normalizeImageSrc(coin);
          return <Image src={img} alt={coin} key={coin} height={28} width={28} />;
        }),
    },
    {
      header: "24h Change",
      cellClassName: "change-header-cell",
      // cell: (category) => category.market_cap_change_24h,
      cell: (category) => {
        const isTrendingUp = category.market_cap_change_24h > 0;
        return (
          <div
            className={cn(
              "change-cell000",
              isTrendingUp ? "text-green-500" : "text-red-500",
            )}
          >
            <p className="flex items-center">
              {isTrendingUp ? (
                <TrendingUp width={16} height={16} />
              ) : (
                <TrendingDown width={16} height={16} />
              )}
              {/*{Math.abs(category.market_cap_change_24h).toFixed(2)}%*/}
              {formatPercentage(category.market_cap_change_24h)}
            </p>
          </div>
        );
      },
    },
    {
      header: "Market Cap",
      cellClassName: "market-cap-cell",
      cell: (category) => formatCurrency(category.market_cap),
    },
    {
      header: "24h Volume",
      cellClassName: "volume-cell",
      cell: (category) => formatCurrency(category.volume_24h),
    },
  ];

  return (
    <div id="categories" className="custom-scrollbar">
      <h4>Top Categories</h4>
      <DataTable
        columns={columns}
        data={categories?.slice(0, 10) || []}
        rowKey={(_, index) => index}
        tableClassName="mt-3"
      />
    </div>
  );
};
export default Categories;