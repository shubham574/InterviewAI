import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* ─── Action Hero Skeleton ─── */}
      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 h-auto md:h-64 w-full">
        <div className="w-full max-w-xl flex flex-col gap-4">
          <div className="h-10 bg-bg-elevated rounded-lg w-3/4"></div>
          <div className="h-6 bg-bg-elevated rounded-lg w-full mb-4"></div>
          <div className="flex gap-4">
            <div className="h-12 bg-bg-elevated rounded-xl w-40"></div>
            <div className="h-12 bg-bg-elevated rounded-xl w-32"></div>
          </div>
        </div>
        <div className="hidden md:flex w-32 h-32 bg-bg-elevated rounded-full shrink-0"></div>
      </div>

      {/* ─── Stats Row Skeleton ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex items-center h-24">
            <div className="w-12 h-12 bg-bg-elevated rounded-xl mr-4 shrink-0"></div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3 bg-bg-elevated rounded w-1/2"></div>
              <div className="h-6 bg-bg-elevated rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Charts & Activity Skeleton ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Chart Skeleton */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-3xl p-6 lg:p-8 h-[360px] flex flex-col">
          <div className="h-6 bg-bg-elevated rounded w-48 mb-8"></div>
          <div className="flex-1 bg-bg-elevated/50 rounded-xl w-full border border-border-subtle/50"></div>
        </div>

        {/* Activity Skeleton */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 lg:p-8 h-[360px] flex flex-col gap-4">
          <div className="h-6 bg-bg-elevated rounded w-32 mb-2"></div>
          
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-bg-elevated rounded-lg shrink-0"></div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-4 bg-bg-elevated rounded w-full"></div>
                <div className="h-3 bg-bg-elevated rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
