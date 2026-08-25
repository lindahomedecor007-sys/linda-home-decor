"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  mainImage?: string;
  subImages?: string[];
  productName: string;
}

export default function ProductImageGallery({
  mainImage,
  subImages = [],
  productName,
}: ProductImageGalleryProps) {
  // Combine all images without duplicates
  const allImages = Array.from(
    new Set([mainImage, ...(subImages || [])].filter(Boolean) as string[])
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const currentImage = allImages[currentIndex] || allImages[0] || "";

  return (
    <div className="space-y-4 select-none">
      {/* Main Display Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-neutral-100 shadow-md group">
        {currentImage ? (
          <Image
            key={currentImage}
            src={currentImage}
            alt={`${productName} view ${currentIndex + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-all duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 bg-neutral-50">
            <ImageIcon className="w-8 h-8 text-neutral-300" />
            <span className="text-xs font-medium">No Image Available</span>
          </div>
        )}

        {/* Previous Button (Left Side Center on Image) */}
        {allImages.length > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-all duration-200 shadow-md cursor-pointer z-20 hover:scale-105 active:scale-95"
            aria-label="Previous Image"
            title="Previous Image"
          >
            <ChevronLeft className="w-5 h-5 -translate-x-0.5" />
          </button>
        )}

        {/* Next Button (Right Side Center on Image) */}
        {allImages.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-all duration-200 shadow-md cursor-pointer z-20 hover:scale-105 active:scale-95"
            aria-label="Next Image"
            title="Next Image"
          >
            <ChevronRight className="w-5 h-5 translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Sub-images / Thumbnail Selector */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {allImages.map((imgUrl, idx) => {
            const isSelected = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative aspect-square rounded-sm overflow-hidden bg-neutral-100 border transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-[#FF9E15] border-[#FF9E15] shadow-xs scale-98"
                    : "border-neutral-200 hover:border-neutral-400 opacity-75 hover:opacity-100"
                }`}
                title={`View image ${idx + 1}`}
              >
                <Image
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
