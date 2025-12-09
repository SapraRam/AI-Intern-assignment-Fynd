"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Submission } from "@/types/submission";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const ITEMS_PER_PAGE = 8;

// Animated Star Rating Component
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizes[size]} transition-all duration-200 ${
            star <= rating
              ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
              : "text-slate-600"
          }`}
          viewBox="0 0 24 24"
          fill={star <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={star <= rating ? 0 : 1.5}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// Badge Component
function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "error" }) {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  subtext, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  subtext: string;
  color: "blue" | "amber" | "emerald" | "rose";
}) {
  const colors = {
    blue: {
      bg: "from-blue-500/20 to-blue-600/5",
      border: "border-blue-500/20 hover:border-blue-500/40",
      icon: "from-blue-500 to-blue-600",
      glow: "group-hover:shadow-blue-500/20",
      text: "text-blue-400"
    },
    amber: {
      bg: "from-amber-500/20 to-amber-600/5",
      border: "border-amber-500/20 hover:border-amber-500/40",
      icon: "from-amber-500 to-orange-500",
      glow: "group-hover:shadow-amber-500/20",
      text: "text-amber-400"
    },
    emerald: {
      bg: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      icon: "from-emerald-500 to-teal-500",
      glow: "group-hover:shadow-emerald-500/20",
      text: "text-emerald-400"
    },
    rose: {
      bg: "from-rose-500/20 to-rose-600/5",
      border: "border-rose-500/20 hover:border-rose-500/40",
      icon: "from-rose-500 to-pink-500",
      glow: "group-hover:shadow-rose-500/20",
      text: "text-rose-400"
    }
  };

  const c = colors[color];

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} p-5 transition-all duration-300 ${c.glow} hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.icon} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <p className={`text-sm ${c.text} mt-1`}>{subtext}</p>
      </div>
      {/* Decorative gradient orb */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br ${c.icon} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
    </div>
  );
}

// Detail Modal Component
function DetailModal({ item, onClose }: { item: Submission; onClose: () => void }) {
  const sentiment = item.rating >= 4 ? "success" : item.rating === 3 ? "warning" : "error";
  const sentimentLabel = item.rating >= 4 ? "Positive" : item.rating === 3 ? "Neutral" : "Needs Attention";
  const sentimentColor = item.rating >= 4 ? "emerald" : item.rating === 3 ? "amber" : "rose";

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className={`relative px-6 py-5 bg-gradient-to-r ${
          sentimentColor === "emerald" ? "from-emerald-500/20 to-transparent" :
          sentimentColor === "amber" ? "from-amber-500/20 to-transparent" :
          "from-rose-500/20 to-transparent"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StarRating rating={item.rating} size="lg" />
              <Badge variant={sentiment}>{sentimentLabel}</Badge>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Customer Review */}
          <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Customer Review
            </h4>
            <div className="relative">
              <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
              <p className="text-base text-slate-200 leading-relaxed pl-4 italic">
                &quot;{item.review}&quot;
              </p>
            </div>
          </div>

          {/* AI Response */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/5 border border-violet-500/20">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-3">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              AI Response
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {item.aiResponse}
            </p>
          </div>

          {/* Summary */}
          <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Summary
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {item.summary}
            </p>
          </div>

          {/* Actions */}
          <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Recommended Actions ({item.actions.length})
            </h4>
            <div className="space-y-2">
              {item.actions.map((action, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-slate-300">{action}</span>
                </div>
              ))}
              {item.actions.length === 0 && (
                <p className="text-sm text-slate-500 italic">No actions recommended</p>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Submitted on {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feedback Item Component
function FeedbackItem({ item, onClick }: { item: Submission; onClick: () => void }) {
  const sentiment = item.rating >= 4 ? "success" : item.rating === 3 ? "warning" : "error";
  const sentimentLabel = item.rating >= 4 ? "Positive" : item.rating === 3 ? "Neutral" : "Needs Attention";

  const timeAgo = (date: string) => {
    const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (sec < 60) return "Just now";
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
  };

  return (
    <div
      onClick={onClick}
      className="group p-4 hover:bg-slate-800/50 transition-all duration-200 cursor-pointer border-b border-slate-800/50 last:border-0"
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <StarRating rating={item.rating} />
          <Badge variant={sentiment}>{sentimentLabel}</Badge>
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {timeAgo(item.createdAt)}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed line-clamp-1 group-hover:text-slate-200 transition-colors">
        &quot;{item.review}&quot;
      </p>
    </div>
  );
}

export function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Submission | null>(null);
  const [filterSentiment, setFilterSentiment] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const { data, error, isLoading, mutate } = useSWR<Submission[]>("/api/submissions", fetcher, { refreshInterval: 5000 });

  // Loading State
  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
          </div>
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Connection Error</h3>
          <p className="text-sm text-slate-400 mb-4">Unable to load feedback data</p>
          <button 
            onClick={() => mutate()} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Analytics
  const total = data.length;
  const avgRating = total > 0 ? data.reduce((s, i) => s + i.rating, 0) / total : 0;
  const positive = data.filter((i) => i.rating >= 4).length;
  const neutral = data.filter((i) => i.rating === 3).length;
  const negative = data.filter((i) => i.rating <= 2).length;
  const satisfaction = total > 0 ? (positive / total) * 100 : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: data.filter((i) => i.rating === r).length }));
  const maxCount = Math.max(...ratingCounts.map((r) => r.count), 1);

  // Filter data
  const filteredData = filterSentiment === "all" ? data :
    filterSentiment === "positive" ? data.filter(i => i.rating >= 4) :
    filterSentiment === "neutral" ? data.filter(i => i.rating === 3) :
    data.filter(i => i.rating <= 2);

  // Pagination
  const totalFiltered = filteredData.length;
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Feedback Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor and analyze customer feedback in real-time</p>
        </div>
        <button 
          onClick={() => mutate()} 
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium transition-all hover:border-slate-600"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          label="Total Feedback"
          value={total}
          subtext="All submissions"
          color="blue"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
          label="Average Rating"
          value={avgRating.toFixed(1)}
          subtext="Out of 5 stars"
          color="amber"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Satisfaction"
          value={`${satisfaction.toFixed(0)}%`}
          subtext={`${positive} positive reviews`}
          color="emerald"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          label="Needs Attention"
          value={negative}
          subtext="Low ratings"
          color="rose"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="space-y-6">
          {/* Rating Distribution */}
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Rating Distribution
            </h3>
            <div className="space-y-4">
              {ratingCounts.map(({ rating, count }) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                const barPct = (count / maxCount) * 100;
                const color = rating >= 4 ? "bg-emerald-500" : rating === 3 ? "bg-amber-500" : "bg-rose-500";
                return (
                  <div key={rating} className="group">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-medium">{rating}</span>
                        <div className="flex">
                          {Array.from({ length: rating }).map((_, i) => (
                            <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-slate-400">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${color}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sentiment Overview */}
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Sentiment Breakdown
            </h3>
            
            {/* Pie-like visual */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="20" />
                  {/* Segments */}
                  {total > 0 && (
                    <>
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray={`${(positive / total) * 251.2} 251.2`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="#f59e0b"
                        strokeWidth="20"
                        strokeDasharray={`${(neutral / total) * 251.2} 251.2`}
                        strokeDashoffset={`${-((positive / total) * 251.2)}`}
                      />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray={`${(negative / total) * 251.2} 251.2`}
                        strokeDashoffset={`${-(((positive + neutral) / total) * 251.2)}`}
                      />
                    </>
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{total}</p>
                    <p className="text-xs text-slate-400">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => { setFilterSentiment(filterSentiment === "positive" ? "all" : "positive"); setCurrentPage(1); }}
                className={`p-3 rounded-xl text-center transition-all ${filterSentiment === "positive" ? "bg-emerald-500/20 border-emerald-500/50" : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800"} border`}
              >
                <p className="text-xl font-bold text-emerald-400">{positive}</p>
                <p className="text-xs text-slate-400">Positive</p>
              </button>
              <button
                onClick={() => { setFilterSentiment(filterSentiment === "neutral" ? "all" : "neutral"); setCurrentPage(1); }}
                className={`p-3 rounded-xl text-center transition-all ${filterSentiment === "neutral" ? "bg-amber-500/20 border-amber-500/50" : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800"} border`}
              >
                <p className="text-xl font-bold text-amber-400">{neutral}</p>
                <p className="text-xs text-slate-400">Neutral</p>
              </button>
              <button
                onClick={() => { setFilterSentiment(filterSentiment === "negative" ? "all" : "negative"); setCurrentPage(1); }}
                className={`p-3 rounded-xl text-center transition-all ${filterSentiment === "negative" ? "bg-rose-500/20 border-rose-500/50" : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800"} border`}
              >
                <p className="text-xl font-bold text-rose-400">{negative}</p>
                <p className="text-xs text-slate-400">Negative</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Feed */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden h-full flex flex-col">
            {/* Feed Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Feedback Feed</h2>
                  <p className="text-xs text-slate-400">
                    {filterSentiment === "all" ? "All submissions" : `${filterSentiment.charAt(0).toUpperCase() + filterSentiment.slice(1)} feedback`}
                    {filterSentiment !== "all" && (
                      <button onClick={() => setFilterSentiment("all")} className="ml-2 text-blue-400 hover:text-blue-300">
                        (Clear filter)
                      </button>
                    )}
                  </p>
                </div>
              </div>
              {totalPages > 1 && (
                <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>

            {/* Feed List */}
            {totalFiltered === 0 ? (
              <div className="flex-1 flex items-center justify-center p-12 text-center">
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">No feedback found</h3>
                  <p className="text-sm text-slate-500">
                    {filterSentiment !== "all" ? "Try clearing the filter" : "Submissions will appear here"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {currentItems.map((item) => (
                  <FeedbackItem 
                    key={item.id} 
                    item={item} 
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/30">
                <p className="text-xs text-slate-500">
                  Showing {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, totalFiltered)} of {totalFiltered}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) page = i + 1;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
