import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { getTrendingCoins } from "@/lib/coingecko.actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Real-time CryptoMarket",
  description:
    "Crypto Screener App with a built-in High-Frequency Terminal Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch trending coins server-side and pass to Header so the client component
  // doesn't call server code directly.
  const trendingCoins = await getTrendingCoins();

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header trendingCoins={trendingCoins} />
        {children}
      </body>
    </html>
  );
}