"use client";

import { useEffect } from "react";
import { CoinOverviewFallback } from "@/components/home/fallback";

export function CoinOverviewErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CoinOverview rendering error:", error);
  }, [error]);

  return <CoinOverviewFallback />;
}
