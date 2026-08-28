/**
 * ProductGallery
 *
 * Product image gallery with a primary display, thumbnail list, active image
 * selection, and a hover-based zoom placeholder. Supports an optional badge
 * overlay (e.g. discount) rendered over the primary image.
 */

import { useState } from "react";
import { ZoomIn } from "lucide-react";
import { cn } from "@/utils/cn";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  badge?: React.ReactNode;
  className?: string;
}

export default function ProductGallery({
  images,
  productName,
  badge,
  className,
}: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const active = images[activeIdx] ?? images[0];

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row-reverse", className)}>
      {/* Primary image */}
      <div className="relative flex-1">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-2xl border border-surface-200 bg-surface-0"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
        >
          <img
            src={active?.url}
            alt={active?.alt ?? productName}
            className={cn(
              "h-full w-full object-contain transition-transform duration-normal ease-smooth",
              zoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in",
            )}
          />
          {/* Zoom placeholder affordance */}
          <span
            className={cn(
              "pointer-events-none absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-900/70 text-white shadow-lg transition-opacity duration-fast",
              zoomed ? "opacity-0" : "opacity-100",
            )}
          >
            <ZoomIn size={16} aria-hidden="true" />
            <span className="sr-only">Zoom in to view details</span>
          </span>
          {badge && <div className="absolute left-3 top-3">{badge}</div>}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          role="radiogroup"
          aria-label={`${productName} image gallery`}
          className="flex gap-2 sm:flex-col"
        >
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              role="radio"
              aria-checked={idx === activeIdx}
              aria-label={img.alt}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-fast sm:h-16 sm:w-16",
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
    </div>
  );
}
