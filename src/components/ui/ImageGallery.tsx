/**
 * ImageGallery
 *
 * Product image gallery with main display and thumbnail strip.
 * Keyboard-navigable thumbnail selection.
 */

import { useState } from "react";
import { cn } from "@/utils/cn";

interface ImageGalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface ImageGalleryProps {
  images: ImageGalleryImage[];
  productName: string;
  className?: string;
}

export default function ImageGallery({ images, productName, className }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = images[activeIdx] ?? images[0];

  return (
    <div className={cn("flex flex-col-reverse gap-3", className)}>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2" role="radiogroup" aria-label={`${productName} image gallery`}>
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              role="radio"
              aria-checked={idx === activeIdx}
              aria-label={img.alt}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-fast sm:h-20 sm:w-20",
                idx === activeIdx
                  ? "border-brand-500 ring-2 ring-brand-200"
                  : "border-surface-200 hover:border-surface-300",
              )}
            >
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-xl border border-surface-200 bg-surface-50">
        <img
          src={active?.url}
          alt={active?.alt ?? productName}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
