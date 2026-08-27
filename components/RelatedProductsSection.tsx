"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { ProductItem } from "@/context/StoreContext";

interface RelatedProductsSectionProps {
  products: ProductItem[];
  title?: string;
}

export default function RelatedProductsSection({
  products,
  title = "Related Products in this Category",
}: RelatedProductsSectionProps) {
  const router = useRouter();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-100">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-light text-neutral-900 tracking-tight">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((prod) => (
          <Link
            key={prod.id}
            href={`/products/${prod.slug || prod.id}`}
            className="group flex flex-col cursor-pointer select-none"
          >
            {/* Product Image Card */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-neutral-100 shadow-xs">
              {prod.image_url ? (
                <Image
                  src={prod.image_url}
                  alt={prod.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 bg-neutral-50">
                  <ImageIcon className="w-6 h-6 text-neutral-300" />
                  <span className="text-[11px] font-medium">No Image</span>
                </div>
              )}

              {/* Category Tag Overlay */}
              {(prod.category_name || prod.category) && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider bg-white/90 backdrop-blur-xs text-neutral-800 rounded-xs shadow-xs">
                    {prod.category_name || prod.category}
                  </span>
                </div>
              )}

              {/* Enquiry Now Button (Hidden on mobile, slides up on desktop hover) */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent hidden sm:flex sm:translate-y-full sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300 ease-out items-center justify-center z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/products/${prod.slug || prod.id}?enquire=true#enquiry`);
                  }}
                  className="w-full py-2.5 sm:py-2 bg-[#FF9E15] hover:bg-[#e0890f] text-white text-center text-xs font-semibold uppercase tracking-wider rounded-xs shadow-md transition-colors block cursor-pointer"
                >
                  Enquire Now
                </button>
              </div>
            </div>

            {/* Product Info below image */}
            <div className="mt-3 flex flex-col">
              <h3
                className="text-xs sm:text-sm font-semibold text-neutral-900 truncate tracking-tight group-hover:text-[#FF9E15] transition-colors"
                title={prod.name}
              >
                {prod.name}
              </h3>

              {/* Specifications Preview (Chips) */}
              {prod.specifications && prod.specifications.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {prod.specifications.slice(0, 2).map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-1.5 py-0.5 text-[10px] bg-neutral-100 text-neutral-600 rounded-xs truncate max-w-[130px]"
                    >
                      {spec}
                    </span>
                  ))}
                  {prod.specifications.length > 2 && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-neutral-100 text-neutral-400 rounded-xs">
                      +{prod.specifications.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Mobile Enquiry Button (Always visible on mobile screens, hidden on desktop) */}
              <div className="mt-2.5 sm:hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/products/${prod.slug || prod.id}?enquire=true#enquiry`);
                  }}
                  className="w-full py-1.5 px-2.5 bg-[#FF9E15] active:bg-[#e0890f] text-white text-center text-[11px] font-bold uppercase tracking-wider rounded-xs shadow-xs transition-colors block cursor-pointer"
                >
                  Enquire Now
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
