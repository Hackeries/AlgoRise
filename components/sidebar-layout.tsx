"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { useCFVerification } from "@/lib/context/cf-verification";
import { useState, useEffect } from "react";
import {
  Calendar,
  Target,
  Trophy,
  BookOpen,
  Users,
  PieChart,
  BarChart3,
  Code2,
  Menu,
} from "lucide-react";

// ------------------ CF Rating System ------------------
const getCFTier = (rating: number) => {
  if (rating < 1200)
    return { label: "Newbie", color: "text-gray-400", bg: "bg-gray-800" };
  if (rating < 1400)
    return { label: "Pupil", color: "text-green-400", bg: "bg-green-900/40" };
  if (rating < 1600)
    return {
      label: "Specialist",
      color: "text-cyan-400",
      bg: "bg-cyan-900/40",
    };
  if (rating < 1900)
    return { label: "Expert", color: "text-blue-400", bg: "bg-blue-900/40" };
  if (rating < 2100)
    return {
      label: "Candidate Master",
      color: "text-purple-400",
      bg: "bg-purple-900/40",
    };
  if (rating < 2300)
    return {
      label: "Master",
      color: "text-orange-400",
      bg: "bg-orange-900/40",
    };
  if (rating < 2400)
    return {
      label: "International Master",
      color: "text-red-400",
      bg: "bg-red-900/40",
    };
  if (rating < 2600)
    return { label: "Grandmaster", color: "text-red-500", bg: "bg-red-900/40" };
  if (rating < 3000)
    return {
      label: "International GM",
      color: "text-red-600",
      bg: "bg-red-950/40",
    };
  return {
    label: "Legendary GM",
    color: "text-yellow-400",
    bg: "bg-yellow-900/40",
  };
};

// ------------------ Menu Items ------------------
const menuItems = [
  { href: "/", label: "Dashboard", icon: Calendar },
  { href: "/adaptive-sheet", label: "Practice Problems", icon: Target },
  { href: "/contests", label: "Contests", icon: Trophy },
  { href: "/paths", label: "Learning Paths", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/visualizers", label: "Visualizers", icon: PieChart },
  { href: "/groups", label: "Groups", icon: Users },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isVerified, verificationData } = useCFVerification();
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [cfData, setCfData] = useState(verificationData);

  // Fetch latest CF rating
  useEffect(() => {
    const fetchLatestCFData = async () => {
      if (verificationData?.handle) {
        try {
          const res = await fetch(
            `https://codeforces.com/api/user.info?handles=${verificationData.handle}`
          );
          const data = await res.json();
          if (data.status === "OK") {
            const user = data.result[0];
            setCfData({
              ...verificationData,
              rating: user.rating || 0,
              maxRating: user.maxRating || 0,
              rank: user.rank,
            });
          }
        } catch (err) {
          console.error("Failed to fetch CF data:", err);
        }
      }
    };
    fetchLatestCFData();
  }, [verificationData?.handle]);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex min-h-screen bg-[#0B1020] text-white">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full flex flex-col bg-[#0B1020] border-r border-white/10 shadow-lg transition-all duration-300",
          isOpen ? "w-64" : "w-16"
        )}
      >
        {/* Top: Hamburger + Logo */}
        <div className="flex items-center justify-start p-4 border-b border-white/10 gap-3">
          <button
            className="p-2 rounded-md hover:bg-white/10 transition"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {isOpen && (
            <Link href="/" className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-[#2563EB]" />
              <span className="font-bold text-lg tracking-tight text-white">
                AlgoRise
              </span>
            </Link>
          )}
        </div>

        {/* Main Menu */}
        <div className="flex-1 mt-4 overflow-y-auto px-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          <nav className="space-y-2">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!isOpen ? item.label : undefined}
                  className={cn(
                    "relative flex items-center gap-3 p-2 rounded-xl transition-all duration-300 cursor-pointer group",
                    isActive
                      ? "bg-[#2563EB]/40 text-[#2563EB] shadow-glow"
                      : "text-white/70 hover:text-white hover:bg-[#2563EB]/20 hover:scale-105",
                    mounted
                      ? `delay-[${idx * 50}ms] translate-x-0 opacity-100`
                      : "translate-x-[-20px] opacity-0"
                  )}
                  style={{
                    transitionProperty: "all",
                    transitionDuration: "300ms",
                    transitionDelay: `${idx * 50}ms`,
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {isOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}

                  {!isOpen && (
                    <span className="absolute left-16 md:left-20 bg-[#1F2330] text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10 flex flex-col items-center">
          {/* CF Verified Badge */}
          {isVerified && cfData && (
            <div
              className={cn(
                "cursor-pointer transition-transform duration-300 hover:scale-105",
                !isOpen ? "flex justify-center" : ""
              )}
              title={`${cfData.handle} (${cfData.rating})`}
            >
              {isOpen ? (
                <div
                  className={`p-3 rounded-xl border ${
                    getCFTier(cfData.rating).bg
                  } ${getCFTier(cfData.rating).color}`}
                >
                  <p className="text-sm font-bold">{cfData.handle}</p>
                  <p className="text-xs">
                    {getCFTier(cfData.rating).label} · {cfData.rating}
                  </p>
                </div>
              ) : (
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full border ${
                    getCFTier(cfData.rating).bg
                  } ${
                    getCFTier(cfData.rating).color
                  } text-[10px] font-bold text-center px-1`}
                >
                  {getCFTier(cfData.rating).label.split(" ")[0]}
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Main Content */}
      <div
        className="flex-1 flex flex-col h-screen transition-all duration-300"
        style={{ marginLeft: isOpen ? "16rem" : "4rem" }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
