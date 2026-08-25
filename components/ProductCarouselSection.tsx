"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useStore, ProductItem } from "@/context/StoreContext";

interface ProductCarouselSectionProps {
  products?: ProductItem[];
}

export default function ProductCarouselSection({ products: propProducts }: ProductCarouselSectionProps) {
  const { products: contextProducts } = useStore();
  const rawProducts = propProducts !== undefined && propProducts.length > 0 ? propProducts : contextProducts;

  const hasProducts = Boolean(rawProducts && rawProducts.length > 0);

  // Strict check: No mock data. Return null if no products exist in database
  if (!hasProducts || !rawProducts || rawProducts.length === 0) {
    return null;
  }

  // Ensure enough items for seamless infinite marquee loop (minimum 8 items per set)
  let baseSet: ProductItem[] = [...rawProducts];
  while (baseSet.length < 8) {
    baseSet = [...baseSet, ...rawProducts];
  }

  // Two identical tracks (set A and set B) for infinite seamless 100% to -50% translateX marquee
  const trackItems = [...baseSet, ...baseSet];

  return (
    <section className="w-full py-12 sm:py-16 md:pt-9 md:pb-9 bg-white text-neutral-900 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Heading */}
        <div className="mb-8 sm:mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-900">
            Products
          </h2>
        </div>

        {/* Continuous Automatic Sliding Container (Pauses on hover) */}
        <div className="w-full overflow-x-auto no-scrollbar py-2">
          <div className="animate-marquee flex gap-4 sm:gap-6 hover:[animation-play-state:paused]">
            {trackItems.map((prod, index) => (
              <Link
                key={`${prod.id}-${index}`}
                href={`/products/${prod.slug || prod.id}`}
                className="group shrink-0 w-64 sm:w-72 md:w-80 flex flex-col cursor-pointer"
              >
                {/* Product Image Card */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-neutral-100 shadow-xs">
                  {prod.image_url ? (
                    <Image
                      src={prod.image_url}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 768px) 280px, 320px"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 bg-neutral-50">
                      <ImageIcon className="w-6 h-6 text-neutral-300" />
                      <span className="text-[11px] font-medium">No Image</span>
                    </div>
                  )}
                </div>

                {/* Product Name Only */}
                <div className="mt-3">
                  <h3
                    className="text-sm sm:text-base font-semibold text-neutral-900 truncate tracking-tight group-hover:text-[#FF9E15] transition-colors"
                    title={prod.name}
                  >
                    {prod.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
