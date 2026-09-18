import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  numReviews = null,
  interactive = false,
  onRatingChange = () => {},
  size = 'w-4 h-4'
}) => {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = rating >= starIndex;
          const isHalf = !isFilled && rating >= starIndex - 0.5;

          return (
            <button
              key={starIndex}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange(starIndex)}
              className={`${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              } focus:outline-hidden`}
            >
              <Star
                className={`${size} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isHalf
                    ? 'text-amber-400 fill-amber-200'
                    : 'text-slate-300 fill-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      {rating > 0 && !interactive && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}

      {numReviews !== null && !interactive && (
        <span className="text-xs text-slate-400">
          ({numReviews})
        </span>
      )}
    </div>
  );
};

export default StarRating;
