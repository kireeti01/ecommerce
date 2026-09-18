import React from 'react';

export const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs animate-pulse">
      <div className="w-full h-64 bg-slate-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-200 rounded-sm w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded-sm w-4/5"></div>
        <div className="h-3 bg-slate-200 rounded-sm w-1/4"></div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-slate-200 rounded-sm w-1/3"></div>
          <div className="h-9 w-9 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse p-4">
      <div className="h-8 bg-slate-200 rounded-sm mb-4"></div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex space-x-4 py-3 border-b border-slate-100 last:border-0">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="h-4 bg-slate-200 rounded-sm flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
