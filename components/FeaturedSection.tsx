"use client";

import Link from "next/link";
import Image from "next/image";
import type { FeaturedSectionData } from "@/lib/featured";
import { useStore } from "@/context/StoreContext";

interface FeaturedSectionProps {
  data?: FeaturedSectionData | null;
}

export default function FeaturedSection({ data: propData }: FeaturedSectionProps) {
  const { featuredData } = useStore();
  const data = propData !== undefined ? propData : featuredData;

  // Strict check: No mock data. If no database record or empty items, do not render.
  if (
    !data ||
    !data.items ||
    data.items.length !== 4 ||
    data.items.every((item) => !item.title && !item.image_url)
  ) {
    return null;
  }

  const items = data.items;

  // Asymmetrical Bento Grid column spans: Row 1 = 5/7, Row 2 = 7/5
  const colSpans = [
    "col-span-12 md:col-span-5", // Card 1: Narrower
    "col-span-12 md:col-span-7", // Card 2: Wider
    "col-span-12 md:col-span-7", // Card 3: Wider
    "col-span-12 md:col-span-5", // Card 4: Narrower
  ];

  return (
    <section className="w-full py-10 sm:py-14 md:pt-9 md:pb-9 bg-white text-neutral-900 select-none">
      {/* Centered Constrained Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Optional Section Heading from Database */}
        {data.heading && (
          <div className="mb-6 sm:mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-900">
              {data.heading}
            </h2>
          </div>
        )}

        {/* Asymmetrical Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-5">
          {items.map((item, index) => {
            const hasImage = Boolean(item.image_url);
            const spanClass = colSpans[index] || "col-span-12 md:col-span-6";

            if (!hasImage && !item.title) {
              return null;
            }

            return (
              <Link
                key={index}
                href={item.link || "/products"}
                className={`group relative block w-full h-[190px] sm:h-[240px] md:h-[280px] lg:h-[320px] overflow-hidden rounded-sm bg-neutral-900 shadow-xs cursor-pointer ${spanClass}`}
              >
                {/* Background Image from DB */}
                {hasImage && (
                  <Image
                    src={item.image_url}
                    alt={item.title || `Featured ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}

                {/* Soft Gradient Overlay for Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none transition-opacity duration-300 group-hover:from-black/75" />

                {/* Bottom Left Title Text from DB */}
                {item.title && (
                  <div className="absolute bottom-3.5 left-3.5 sm:bottom-5 sm:left-5 md:bottom-6 md:left-6 z-10">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-[22px] font-medium tracking-normal text-white drop-shadow-sm transition-transform duration-300 group-hover:translate-x-1">
                      {item.title}
                    </h3>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
