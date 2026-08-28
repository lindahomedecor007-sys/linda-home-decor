"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ImageIcon,
  Package,
  Search,
  X,
} from "lucide-react";
import { useStore, CategoryItem, ProductItem } from "@/context/StoreContext";
import CatalogDownloadSection from "@/components/CatalogDownloadSection";

interface ProductsViewProps {
  initialCategories: CategoryItem[];
  initialProducts: ProductItem[];
  initialCategorySlug?: string;
}

function ProductsViewContent({
  initialCategories,
  initialProducts,
  initialCategorySlug,
}: ProductsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories: storeCategories, products: storeProducts } = useStore();

  // Use live store data if available, fallback to initial props
  const categories = storeCategories && storeCategories.length > 0 ? storeCategories : initialCategories;
  const allProducts = storeProducts && storeProducts.length > 0 ? storeProducts : initialProducts;

  // Active Category resolution (from URL or initial prop)
  const currentCategoryParam = searchParams?.get("category") || initialCategorySlug || "";
  const [searchQuery, setSearchQuery] = useState("");
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  // Find the selected category object if any (returns null if "all" or not specified, showing all products)
  const selectedCategory = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    if (!currentCategoryParam || currentCategoryParam.toLowerCase() === "all") return null;
    const lowerParam = currentCategoryParam.toLowerCase().trim();
    return (
      categories.find(
        (c) =>
          c.slug.toLowerCase() === lowerParam ||
          c.id.toLowerCase() === lowerParam ||
          c.name.toLowerCase() === lowerParam
      ) || null
    );
  }, [currentCategoryParam, categories]);

  // Auto-scroll the active category tab to front/center (especially on mobile)
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedCategory]);

  // Filter products by category and optional search query
  const filteredProducts = useMemo(() => {
    let list = allProducts;

    // Filter by category only if a specific category is selected
    if (selectedCategory) {
      list = list.filter((p) => {
        const catIdMatch = p.category_id && p.category_id === selectedCategory.id;
        const catNameMatch =
          p.category_name &&
          p.category_name.toLowerCase() === selectedCategory.name.toLowerCase();
        const catGenericMatch =
          p.category &&
          p.category.toLowerCase() === selectedCategory.name.toLowerCase();
        const slugMatch =
          p.slug && p.slug.toLowerCase() === selectedCategory.slug.toLowerCase();
        return Boolean(catIdMatch || catNameMatch || catGenericMatch || slugMatch);
      });
    }

    // Filter by search query if user searches
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category_name && p.category_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allProducts, selectedCategory, searchQuery]);

  // Change category handler
  const handleCategorySelect = (slug?: string) => {
    setSearchQuery("");
    if (!slug || slug.toLowerCase() === "all") {
      router.push("/products", { scroll: false });
    } else {
      router.push(`/products?category=${encodeURIComponent(slug)}`, { scroll: false });
    }
  };

  // Banner image: Use database category image if available, or fallback to first available category image
  const defaultBannerImage = categories.find((c) => c.image_url)?.image_url;
  const bannerImageUrl = selectedCategory ? (selectedCategory.image_url || defaultBannerImage) : defaultBannerImage;
  const bannerTitle = selectedCategory ? selectedCategory.name : "All Products";

  // Catalog URL: Selected category's catalog
  const activeCatalogUrl = selectedCategory?.catalog_url;

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900">
      {/* 
        ========================================================================
        1. HALF-SCREEN CATEGORY BANNER (Half of screen height, h-[45vh] to h-[50vh])
        ========================================================================
      */}
      <section className="relative w-full h-[45vh] min-h-[340px] max-h-[460px] flex flex-col items-center justify-center pt-16 overflow-hidden bg-neutral-900">
        {/* Banner Background Image (Only rendered if image_url exists in database) */}
        {bannerImageUrl && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={bannerImageUrl}
              alt={bannerTitle}
              fill
              priority
              className="object-cover object-center scale-105 transition-all duration-1000 ease-out brightness-90"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35" />
          </div>
        )}

        {/* Banner Content Inside Category Image */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white flex flex-col items-center justify-center my-auto">
          {/* Category Title Inside Image Banner */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white drop-shadow-md">
            {bannerTitle}
          </h1>

          {/* Count Badge */}
          <div className="mt-3 inline-flex items-center justify-center text-xs sm:text-sm text-neutral-200">
            <span>
              {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Available
            </span>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        REUSABLE CATALOGUE DOWNLOAD SECTION (Between Banner and Category Filter)
        Only shown when a specific category is selected (hidden on All Products)
        ========================================================================
      */}
      {selectedCategory && (
        <CatalogDownloadSection
          categoryName={selectedCategory.name}
          catalogUrl={activeCatalogUrl || undefined}
          variant="bar"
          showEnquiryFallback={true}
        />
      )}

      {/* 
        ========================================================================
        2. CATEGORY SWITCHER PILLS & SEARCH BAR
        ========================================================================
      */}
      <section className="sticky top-0 md:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Horizontal Scrollable Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
              {/* All Products Tab */}
              <button
                ref={!selectedCategory ? activeTabRef : null}
                type="button"
                onClick={() => handleCategorySelect()}
                className={`px-4 py-1.5 rounded-xs text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  !selectedCategory
                    ? "bg-[#FF9E15] text-white shadow-xs"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                <span>All Products</span>
              </button>

              {categories.map((cat) => {
                const isActive = selectedCategory?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    ref={isActive ? activeTabRef : null}
                    type="button"
                    onClick={() => handleCategorySelect(cat.slug || cat.id)}
                    className={`px-4 py-1.5 rounded-xs text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#FF9E15] text-white shadow-xs"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search (Hidden on Mobile) */}
            <div className="hidden md:block relative shrink-0 w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xs focus:outline-none focus:border-[#FF9E15] focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        3. RELATED PRODUCTS GRID
        ========================================================================
      */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16">
        {filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-neutral-900">
              {searchQuery ? "No matching products found" : "No products in this category yet"}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              {searchQuery
                ? `We couldn't find any products matching "${searchQuery}". Try a different search term or clear the filter.`
                : "We are currently preparing items for this category. Please check other categories or contact our design team."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => handleCategorySelect()}
                  className="w-44 sm:w-48 py-2.5 inline-flex items-center justify-center text-xs sm:text-sm font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded-xs transition-colors shadow-xs cursor-pointer text-center"
                >
                  View All Products
                </button>
              )}
              <Link
                href="/contact"
                className="w-44 sm:w-48 py-2.5 inline-flex items-center justify-center text-xs sm:text-sm font-medium bg-[#FF9E15] hover:bg-[#FF9E15]/90 text-white rounded-xs transition-colors shadow-xs text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid - 2 columns on mobile, responsive multi-column on tablet/desktop */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((prod) => (
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProductsView(props: ProductsViewProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-white pt-24 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FF9E15] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsViewContent {...props} />
    </Suspense>
  );
}

