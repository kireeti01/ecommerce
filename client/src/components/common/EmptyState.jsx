import React from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'We couldn’t find any items matching your criteria. Try adjusting your filters or search terms.',
  actionText = 'Browse All Products',
  actionLink = '/products'
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-5 shadow-xs">
        <Icon className="w-10 h-10 stroke-[1.5]" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
