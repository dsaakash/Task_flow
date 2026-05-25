"use client";

import { TrendingUp, AlertTriangle } from "lucide-react";

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "indigo", // "indigo" | "violet" | "emerald" | "amber" | "rose"
}) {
  const colorSchemes = {
    indigo: {
      border: "hover:border-indigo-500/30",
      bgGlow: "bg-indigo-500/5",
      iconBg: "bg-indigo-500/10 text-indigo-400",
      accent: "text-indigo-400",
    },
    violet: {
      border: "hover:border-violet-500/30",
      bgGlow: "bg-violet-500/5",
      iconBg: "bg-violet-500/10 text-violet-400",
      accent: "text-violet-400",
    },
    emerald: {
      border: "hover:border-emerald-500/30",
      bgGlow: "bg-emerald-500/5",
      iconBg: "bg-emerald-500/10 text-emerald-400",
      accent: "text-emerald-400",
    },
    amber: {
      border: "hover:border-amber-500/30",
      bgGlow: "bg-amber-500/5",
      iconBg: "bg-amber-500/10 text-amber-400",
      accent: "text-amber-400",
    },
    rose: {
      border: "hover:border-rose-500/30",
      bgGlow: "bg-rose-500/5",
      iconBg: "bg-rose-500/10 text-rose-400",
      accent: "text-rose-400",
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <div
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${scheme.border} relative overflow-hidden group`}
    >
      {/* Background Subtle Gradient Glow */}
      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-40 transition-all duration-500 group-hover:scale-125 ${scheme.bgGlow}`}
      />

      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-white tracking-tight leading-none">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold">
          {color === "rose" ? (
            <>
              <AlertTriangle className="h-3 w-3 text-rose-400" />
              <span className="text-rose-400">{trend} requires attention</span>
            </>
          ) : (
            <>
              <TrendingUp className={`h-3 w-3 ${scheme.accent}`} />
              <span className="text-zinc-400">{trend}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
