import { Link2, Activity } from "lucide-react";
import type { LinkStats } from "@/types";

interface StatsCardsProps {
  stats: LinkStats;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Links",
      value: stats.totalLinks,
      icon: Link2,
      color: "blue",
    },
    {
      label: "Total Clicks",
      value: stats.totalClicks,
      icon: Activity,
      color: "cyan",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">
                  {card.label}
                </p>
                {loading ? (
                  <div className="mt-2 h-8 w-16 animate-pulse rounded bg-white/10" />
                ) : (
                  <p className="mt-2 text-3xl sm:text-4xl font-bold text-white tabular-nums">
                    {card.value.toLocaleString()}
                  </p>
                )}
              </div>
              <div
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${
                  card.color === "blue"
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-cyan-500/15 text-cyan-400"
                }`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
