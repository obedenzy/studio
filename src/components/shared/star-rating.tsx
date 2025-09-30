"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  count?: number;
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  className?: string;
}

export function StarRating({
  count = 5,
  value,
  onChange,
  size = 32,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const stars = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {stars.map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => onChange(starValue)}
          onMouseEnter={() => setHoverValue(starValue)}
          onMouseLeave={() => setHoverValue(0)}
          className="cursor-pointer"
          aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={cn(
              "transition-colors text-muted-foreground/50",
              (hoverValue || value) >= starValue && "text-yellow-400 fill-yellow-400"
            )}
          />
        </button>
      ))}
    </div>
  );
}
