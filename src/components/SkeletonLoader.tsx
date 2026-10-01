import React from 'react';

export const SearchResultSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 w-full">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl skeleton-shimmer" />
              <div className="space-y-2">
                <div className="w-32 h-4 rounded-md skeleton-shimmer" />
                <div className="w-48 h-3 rounded-md skeleton-shimmer" />
              </div>
            </div>
            <div className="w-20 h-6 rounded-full skeleton-shimmer" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-stone-100">
            <div className="h-8 rounded-lg skeleton-shimmer" />
            <div className="h-8 rounded-lg skeleton-shimmer" />
            <div className="h-8 rounded-lg skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ItinerarySkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="space-y-2">
          <div className="w-40 h-5 rounded-md skeleton-shimmer" />
          <div className="w-60 h-3 rounded-md skeleton-shimmer" />
        </div>
        <div className="w-24 h-8 rounded-xl skeleton-shimmer" />
      </div>

      <div className="space-y-6 pl-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full skeleton-shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-4 rounded-md skeleton-shimmer" />
              <div className="w-1/2 h-3 rounded-md skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FleetTableSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-stone-100 flex items-center justify-between">
        <div className="w-48 h-5 rounded-md skeleton-shimmer" />
        <div className="w-32 h-8 rounded-xl skeleton-shimmer" />
      </div>
      <div className="divide-y divide-stone-100">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
              <div className="space-y-1.5">
                <div className="w-28 h-4 rounded-md skeleton-shimmer" />
                <div className="w-40 h-3 rounded-md skeleton-shimmer" />
              </div>
            </div>
            <div className="w-24 h-6 rounded-full skeleton-shimmer" />
            <div className="w-16 h-4 rounded-md skeleton-shimmer" />
            <div className="w-20 h-8 rounded-lg skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
};
