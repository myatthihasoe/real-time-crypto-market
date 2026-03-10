"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import SearchModal from "@/components/SearchModal";

interface HeaderProps {
  trendingCoins: TrendingCoin[];
}

const Header = ({trendingCoins} : HeaderProps) => {
  const pathname = usePathname();
  return (
    <header>
      <div className="main-container inner">
        <Link href="/">
          <Image src="/Crypto Logo2.svg" alt="logo" width={140} height={100} />
        </Link>
        <nav>
          <Link
            href="/"
            className={cn("nav-link", {
              "is-active": pathname === "/",
              "is-home": true,
            })}
          >
            Home
          </Link>
          <SearchModal initialTrendingCoins={trendingCoins} />
          <Link
            href="/coins"
            className={cn("nav-link", {
              "is-active": pathname === "/coins",
            })}
          >
            Coins
          </Link>
        </nav>
      </div>
    </header>
  );
};
export default Header;