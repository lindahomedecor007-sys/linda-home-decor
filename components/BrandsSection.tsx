"use client";

import Link from "next/link";
import Image from "next/image";
import { BrandsSectionData } from "@/lib/brands";
import { useStore } from "@/context/StoreContext";

interface BrandsSectionProps {
  data?: BrandsSectionData | null;
}

export default function BrandsSection({ data: propData }: BrandsSectionProps) {
  const { brandsData } = useStore();
  const data = propData !== undefined ? propData : brandsData;

  // Strict check: No mock data. Return null if no brands data exists in database
  if (!data || !data.brands || data.brands.length === 0) {
    return null;
  }

  const subTitle = data.sub_title || "";
  const heading = data.heading || "";
  const brands = data.brands.filter((b) => Boolean(b.image_url));

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 sm:py-20 md:pt-12 md:pb-12 bg-white text-neutral-900 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Subtitle & Main Heading matching reference image */}
        <div className="text-center mb-10 sm:mb-14 space-y-1">
          {subTitle && (
            <p className="text-xs sm:text-sm font-medium text-neutral-500 tracking-normal">
              {subTitle}
            </p>
          )}
          {heading && (
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-900">
              {heading}
            </h2>
          )}
        </div>

        {/* 5-Column Grid matching reference design */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 rounded-sm overflow-hidden bg-white">
          {brands.map((brand, index) => {
            const isLastOdd = index === brands.length - 1 && brands.length % 2 === 1;
            const spanClass = isLastOdd ? "col-span-2 sm:col-span-1 md:col-span-1" : "";

            const cardContent = (
              <div className="w-full h-28 sm:h-32 md:h-36 flex items-center justify-center p-4 sm:p-6 bg-white transition-all duration-300 hover:shadow-lg hover:z-10 hover:scale-[1.02] cursor-pointer group relative">
                <div className="relative w-[130px] sm:w-[150px] h-12 sm:h-14 md:h-16">
                  <Image
                    src={brand.image_url}
                    alt={brand.name || `Brand ${index + 1}`}
                    fill
                    sizes="150px"
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            );

            if (brand.link) {
              return (
                <Link key={brand.id || index} href={brand.link} className={`block relative ${spanClass}`}>
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={brand.id || index} className={`relative ${spanClass}`}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
