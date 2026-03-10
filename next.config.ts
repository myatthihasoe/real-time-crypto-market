import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.coingecko.com", // Allows any subdomain of coingecko.com
            },
        ],
    },
};

export default nextConfig;
