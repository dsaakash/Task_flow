"use client";

import { useEffect, useState } from "react";

// 1. Beautiful animated SVG Radial Progress Ring
export function RadialProgressRing({
  percentage = 0,
  size = 120,
  strokeWidth = 10,
  color = "#6366f1", // primary theme
  glow = true,
}) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    const progress = Math.min(Math.max(percentage, 0), 100);
    const progressOffset = circumference - (progress / 100) * circumference;
    setOffset(progressOffset);
  }, [percentage, circumference]);

  const cleanPercentage = Math.round(percentage) || 0;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Foreground Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: glow ? `drop-shadow(0 0 4px ${color}44)` : "none",
          }}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white tracking-tight leading-none">
          {cleanPercentage}%
        </span>
        <span className="text-[10px] text-zinc-500 font-semibold uppercase mt-0.5 tracking-wider">
          Done
        </span>
      </div>
    </div>
  );
}

// 2. Multi-segmented, stacked task breakdown bar
export function TaskStatusBar({ todo = 0, inProgress = 0, completed = 0 }) {
  const total = todo + inProgress + completed;
  
  const getPercentage = (val) => {
    if (total === 0) return 0;
    return (val / total) * 100;
  };

  const todoPct = getPercentage(todo);
  const inProgressPct = getPercentage(inProgress);
  const completedPct = getPercentage(completed);

  return (
    <div className="space-y-4">
      {/* Percentage Bar */}
      <div className="h-3.5 w-full bg-zinc-900 rounded-full flex overflow-hidden border border-zinc-800/40">
        {completedPct > 0 && (
          <div
            style={{ width: `${completedPct}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all duration-500"
            title={`Completed: ${completed}`}
          />
        )}
        {inProgressPct > 0 && (
          <div
            style={{ width: `${inProgressPct}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.2)] transition-all duration-500"
            title={`In Progress: ${inProgress}`}
          />
        )}
        {todoPct > 0 && (
          <div
            style={{ width: `${todoPct}%` }}
            className="h-full bg-gradient-to-r from-zinc-700 to-zinc-600 transition-all duration-500"
            title={`Todo: ${todo}`}
          />
        )}
        {total === 0 && (
          <div className="h-full w-full bg-zinc-800 transition-all duration-500" />
        )}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="flex flex-col items-center p-2 rounded-xl bg-zinc-900/30 border border-zinc-900">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Done</span>
          </div>
          <span className="text-sm font-bold text-zinc-200">{completed}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl bg-zinc-900/30 border border-zinc-900">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Working</span>
          </div>
          <span className="text-sm font-bold text-zinc-200">{inProgress}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl bg-zinc-900/30 border border-zinc-900">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="h-2 w-2 rounded-full bg-zinc-500" />
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Queue</span>
          </div>
          <span className="text-sm font-bold text-zinc-200">{todo}</span>
        </div>
      </div>
    </div>
  );
}
