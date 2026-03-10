"use server";

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error("Could not get base url");
if (!API_KEY) throw new Error("Could not get api key");

export async function fetcher<T>(
    endpoint: string,
    params?: QueryParams,
    revalidate = 60,
): Promise<T> {
    const url = qs.stringifyUrl(
        {
            url: `${BASE_URL}/${endpoint}`,
            query: params,
        },
        {skipEmptyString: true, skipNull: true},
    );
    const response = await fetch(url, {
        headers: {
            'x-cg-pro-api-key': API_KEY,
            "Content-Type": "application/json",
        } as Record<string, string>,
        next: {revalidate},
    });
    if (!response.ok) {
        const errorBody: CoinGeckoErrorBody = await response
            .json()
            .catch(() => ({}));
        throw new Error(
            `API Error: ${response.status}: ${errorBody.error || response.statusText}`,
        );
    }
    return response.json();
}

export async function getPools(
    id: string,
    network?: string | null,
    contractAddress?: string | null
): Promise<PoolData> {
    const fallback: PoolData = {
        id: "",
        address: "",
        name: "",
        network: "",
    };

    if (network && contractAddress) {
        try {
            const poolData = await fetcher<{ data: PoolData[] }>(
                `/onchain/networks/${network}/tokens/${contractAddress}/pools`
            );
            return poolData.data?.[0] ?? fallback;
        }
        catch (error){
            return fallback;
        }
    }

    const poolData = await fetcher<{ data: PoolData[] }>(
        "/onchain/search/pools",
        {query: id}
    );
    return poolData.data?.[0] ?? fallback;
}

// The two functions below implement searching coins by query and fetching trending coins.

export async function searchCoins(query: string): Promise<SearchCoin[]> {
    if (!query || query.trim().length === 0) return [];
    try {
        // First, use the /search endpoint to get basic coin info
        const searchResp = await fetcher<{ coins: Array<any> }>("search", { query });
        const coins = searchResp.coins ?? [];
        if (coins.length === 0) return [];

        // Enrich with market data from /coins/markets to get price and 24h change
        const ids = coins.map((c: any) => c.id).filter(Boolean).slice(0, 50).join(",");
        if (!ids) return [];

        const markets = await fetcher<any[]>("coins/markets", {
            vs_currency: "usd",
            ids,
            per_page: 250,
            price_change_percentage: "24h",
        });

        const marketsMap = new Map<string, any>(
            (markets || []).map((m: any) => [m.id, m])
        );

        const results: SearchCoin[] = coins.map((c: any) => {
            const m = marketsMap.get(c.id);
            return {
                id: c.id,
                name: c.name,
                symbol: c.symbol,
                market_cap_rank: c.market_cap_rank ?? m?.market_cap_rank ?? null,
                thumb: c.thumb ?? m?.image ?? "",
                large: c.large ?? m?.large ?? m?.image ?? "",
                data: {
                    price: m?.current_price,
                    price_change_percentage_24h: m?.price_change_percentage_24h ?? 0,
                },
            };
        });

        return results;
    } catch (error) {
        // Return empty array on failure to avoid breaking callers
        return [];
    }
}

export async function getTrendingCoins(): Promise<TrendingCoin[]> {
    try {
        // Get trending list
        const resp = await fetcher<{ coins: Array<any> }>("search/trending");
        const trending = resp.coins ?? [];
        if (trending.length === 0) return [];

        const ids = trending
            .map((t: any) => t.item?.id)
            .filter(Boolean)
            .slice(0, 50)
            .join(",");

        let marketsMap = new Map<string, any>();
        if (ids) {
            const markets = await fetcher<any[]>("coins/markets", {
                vs_currency: "usd",
                ids,
                per_page: 250,
                price_change_percentage: "24h",
            });
            marketsMap = new Map((markets || []).map((m: any) => [m.id, m]));
        }

        const results: TrendingCoin[] = trending.map((t: any) => {
            const item = t.item;
            const m = marketsMap.get(item.id);
            return {
                item: {
                    id: item.id,
                    name: item.name,
                    symbol: item.symbol,
                    market_cap_rank: item.market_cap_rank ?? m?.market_cap_rank ?? 0,
                    thumb: item.thumb ?? m?.image ?? "",
                    large: item.large ?? m?.image ?? "",
                    data: {
                        price: m?.current_price ?? 0,
                        price_change_percentage_24h: {
                            usd: m?.price_change_percentage_24h ?? 0,
                        },
                    },
                },
            };
        });

        return results;
    } catch (error) {
        return [];
    }
}