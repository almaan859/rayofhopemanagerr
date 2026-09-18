import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

const accents = {
  blue: "from-sky-400/20 to-blue-500/10 text-sky-600 dark:text-sky-300",
  green: "from-emerald-400/20 to-green-500/10 text-emerald-600 dark:text-emerald-300",
  amber: "from-amber-400/20 to-orange-500/10 text-amber-600 dark:text-amber-300",
  violet: "from-violet-400/20 to-purple-500/10 text-violet-600 dark:text-violet-300",
  rose: "from-rose-400/20 to-pink-500/10 text-rose-600 dark:text-rose-300",
};

export default function StatCard({ icon: Icon, label, value, sub, accent = "blue", trend, index = 0 }) {
  return (
    <div
      className="glass p-5 animate-slide-up hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.22)] transition-shadow"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={cn("h-11 w-11 rounded-xl bg-gradient-to-br grid place-items-center", accents[accent])}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {trend != null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(trend)}%
          </span>
        )}
        {sub && <span className="text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}