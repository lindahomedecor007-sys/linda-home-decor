"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageIcon } from "lucide-react";
import { useStore, CategoryItem } from "@/context/StoreContext";

interface CategorySectionProps {
  categories?: CategoryItem[];
}

export default function CategorySection({ categories: propCategories }: CategorySectionProps) {
  const { categories: contextCategories } = useStore();
  const categories = propCategories !== undefined ? propCategories : contextCategories;

  // Strict check: No mock data. Return null if no categories exist in database
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 sm:py-16 md:pt-12 md:pb-12 bg-white text-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Heading */}
        <div className="mb-8 sm:mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-900">
            Product Category
          </h2>
        </div>

        {/* 4-Column Grid matching reference design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug || cat.id}`}
              className="group flex flex-col cursor-pointer"
            >
              {/* Category Image Card */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-neutral-100 shadow-xs">
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 bg-neutral-50">
                    <ImageIcon className="w-6 h-6 text-neutral-300" />
                    <span className="text-[11px] font-medium">No Image</span>
                  </div>
                )}
              </div>

              {/* Category Name below image */}
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 mt-3 truncate tracking-tight group-hover:text-[#FF9E15] transition-colors" title={cat.name}>
                {cat.name}
              </h3>

              {/* Circular Action Arrow Button */}
              <div className="mt-2 flex items-center">
                <div className="w-8 h-8 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-neutral-800 group-hover:border-[#FF9E15] group-hover:bg-[#FF9E15] group-hover:text-white transition-all shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
