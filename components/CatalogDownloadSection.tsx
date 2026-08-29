"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FolderOpen,
} from "lucide-react";
import { CategoryItem, CatalogItem, useStore } from "@/context/StoreContext";

export interface CatalogDownloadSectionProps {
  categories?: CategoryItem[];
  selectedCategory?: CategoryItem | null;
  selectedCategorySlug?: string;
  categoryName?: string;
  catalogs?: CatalogItem[];
  className?: string;
  showEnquiryFallback?: boolean;
  onCategoryChange?: (slug?: string) => void;
}

interface CategoryGroup {
  id: string;
  categoryName: string;
  categorySlug: string;
  catalogs: CatalogItem[];
}

export default function CatalogDownloadSection({
  categories: propCategories,
  selectedCategory: propSelectedCategory,
  selectedCategorySlug,
  categoryName,
  catalogs: propCatalogs,
  className = "",
  showEnquiryFallback = true,
  onCategoryChange,
}: CatalogDownloadSectionProps) {
  const { categories: storeCategories } = useStore();
  const allCategories =
    propCategories && propCategories.length > 0 ? propCategories : storeCategories;

  // Expand state for categories with multiple catalogues (default all open for immediate visibility)
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Record<string, boolean>>({});

  // Sync with prop when prop changes
  const activeSlug = selectedCategorySlug || (propSelectedCategory ? propSelectedCategory.slug : "all");

  const activeCategory = useMemo(() => {
    if (propSelectedCategory) return propSelectedCategory;
    if (!activeSlug || activeSlug === "all") return null;
    return (
      allCategories.find(
        (c) =>
          c.slug.toLowerCase() === activeSlug.toLowerCase() ||
          c.name.toLowerCase() === activeSlug.toLowerCase()
      ) || null
    );
  }, [allCategories, activeSlug, propSelectedCategory]);

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategoryIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Group catalogues by category
  const categoryGroups: CategoryGroup[] = useMemo(() => {
    const groups: CategoryGroup[] = [];

    // If explicit propCatalogs passed
    if (propCatalogs && propCatalogs.length > 0) {
      const valid = propCatalogs.filter((c) => Boolean(c.url && c.url.trim()));
      if (valid.length > 0) {
        groups.push({
          id: "prop-category",
          categoryName: categoryName || "Selected Category",
          categorySlug: activeCategory?.slug || "selected",
          catalogs: valid,
        });
        return groups;
      }
    }

    allCategories.forEach((cat) => {
      let catList: CatalogItem[] = [];

      if (cat.catalogs && cat.catalogs.length > 0) {
        catList = cat.catalogs.filter((c) => Boolean(c.url && c.url.trim()));
      } else if (cat.catalog_url && cat.catalog_url.trim()) {
        catList = [
          {
            name: `${cat.name} Catalogue`,
            url: cat.catalog_url.trim(),
            pages: "20 Pages",
            file_size: "8.5 MB",
          },
        ];
      }

      if (catList.length > 0) {
        groups.push({
          id: cat.id,
          categoryName: cat.name,
          categorySlug: cat.slug,
          catalogs: catList,
        });
      }
    });

    return groups;
  }, [allCategories, propCatalogs, categoryName, activeCategory]);

  // Filter groups by active category
  const filteredGroups = useMemo(() => {
    return categoryGroups.filter((group) => {
      if (!activeCategory) return true;
      return (
        group.categorySlug.toLowerCase() === activeCategory.slug.toLowerCase() ||
        group.categoryName.toLowerCase() === activeCategory.name.toLowerCase()
      );
    });
  }, [categoryGroups, activeCategory]);

  const formatMobileText = (text?: string, limit = 10) => {
    if (!text) return "";
    if (text.length > limit) {
      return `${text.slice(0, limit)}...`;
    }
    return text;
  };

  const displayTitle = activeCategory
    ? `${activeCategory.name} Collection Catalogue`
    : categoryName
    ? `${categoryName} Collection Catalogue`
    : "Linda Home Decor Catalogues";

  return (
    <div className={`w-full bg-white text-neutral-900 py-6 sm:py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Header Strip */}
        <div className="flex flex-row items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-sm bg-[#FF9E15]/15 text-[#FF9E15] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#FF9E15]" />
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-neutral-900 tracking-tight truncate">
              {displayTitle}
            </h2>
          </div>

          {filteredGroups.length === 0 ? (
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xs transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <span>Request Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF9E15]" />
            </Link>
          ) : (
            <span className="text-xs text-neutral-500 font-medium text-right shrink-0">
              Choose a catalogue to view or download
            </span>
          )}
        </div>

        {/* Catalogue Listing Table matching Reference Image */}
        {filteredGroups.length > 0 && (
          <div className="bg-white rounded-md border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="w-full overflow-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/60 text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    <th className="py-3 px-2.5 sm:px-6 w-[54%] sm:w-5/12">Catalogue Name</th>
                    <th className="py-3 px-4 sm:px-6 w-2/12 hidden sm:table-cell">Pages</th>
                    <th className="py-3 px-4 sm:px-6 w-2/12 hidden sm:table-cell">File Size</th>
                    <th className="py-3 px-2.5 sm:px-6 w-[46%] sm:w-3/12 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
                  {filteredGroups.map((group) => {
                    const isSingle = group.catalogs.length === 1;
                    const isExpanded = Boolean(expandedCategoryIds[group.id]);

                    // CASE 1: Category has exactly 1 catalogue
                    if (isSingle) {
                      const singleCat = group.catalogs[0];
                      const rawName = singleCat.name || `${group.categoryName} Catalogue`;

                      return (
                        <tr
                          key={`${group.id}-single`}
                          className="hover:bg-amber-50/20 transition-colors group"
                        >
                          {/* Catalogue Name with Orange Document Icon & 10-char Mobile Truncation */}
                          <td className="py-3 px-2.5 sm:px-6 min-w-0">
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                              <div className="hidden sm:flex w-7 h-7 rounded-xs bg-[#FF9E15]/15 text-[#FF9E15] items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-[#FF9E15]" />
                              </div>
                              <div className="min-w-0 flex-1 overflow-hidden">
                                {/* Mobile View: 10 letters then ... */}
                                <span
                                  className="sm:hidden font-semibold text-neutral-900 block group-hover:text-[#FF9E15] transition-colors"
                                  title={rawName}
                                >
                                  {formatMobileText(rawName, 10)}
                                </span>
                                {/* Desktop View: Full name */}
                                <span
                                  className="hidden sm:block font-semibold text-neutral-900 group-hover:text-[#FF9E15] transition-colors truncate max-w-full"
                                  title={rawName}
                                >
                                  {rawName}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Pages Count (Hidden on mobile) */}
                          <td className="py-3.5 px-4 sm:px-6 font-medium text-neutral-600 hidden sm:table-cell truncate">
                            {singleCat.pages || "20 Pages"}
                          </td>

                          {/* File Size (Hidden on mobile) */}
                          <td className="py-3.5 px-4 sm:px-6 font-medium text-neutral-600 hidden sm:table-cell truncate">
                            {singleCat.file_size || "8.5 MB"}
                          </td>

                          {/* Download PDF Action Button */}
                          <td className="py-3 px-2.5 sm:px-6 text-right shrink-0">
                            <a
                              href={singleCat.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xs bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-semibold shadow-2xs transition-all duration-200 cursor-pointer whitespace-nowrap"
                            >
                              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                              <span>Download PDF</span>
                            </a>
                          </td>
                        </tr>
                      );
                    }

                    // CASE 2: Category has 2 or more catalogues -> Dropdown / Expand option that opens showing each catalogue in the same design
                    return (
                      <React.Fragment key={`${group.id}-multi-wrapper`}>
                        {/* Parent Category Header Row with Dropdown Toggle */}
                        <tr className="bg-neutral-50/70 border-y border-neutral-200/80 hover:bg-amber-50/30 transition-colors">
                          {/* Mobile left cell */}
                          <td colSpan={1} className="py-2.5 px-2.5 sm:px-6 sm:hidden min-w-0">
                            <button
                              type="button"
                              onClick={() => toggleCategoryExpand(group.id)}
                              className="flex items-center gap-2 text-left font-bold text-neutral-900 hover:text-[#FF9E15] transition-colors cursor-pointer w-full min-w-0"
                            >
                              <div className="w-5 h-5 rounded-xs bg-[#FF9E15]/20 text-[#b45309] flex items-center justify-center shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <span className="text-xs font-bold text-neutral-900 truncate min-w-0 flex-1" title={group.categoryName}>
                                {formatMobileText(group.categoryName, 10)}
                              </span>
                              <span className="text-[10px] font-bold text-[#b45309] bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0">
                                {group.catalogs.length}
                              </span>
                            </button>
                          </td>

                          {/* Desktop left cell */}
                          <td colSpan={3} className="py-2.5 px-4 sm:px-6 hidden sm:table-cell min-w-0">
                            <button
                              type="button"
                              onClick={() => toggleCategoryExpand(group.id)}
                              className="flex items-center gap-2 text-left font-bold text-neutral-900 hover:text-[#FF9E15] transition-colors cursor-pointer w-full min-w-0"
                            >
                              <div className="w-5 h-5 rounded-xs bg-[#FF9E15]/20 text-[#b45309] flex items-center justify-center shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <span className="text-xs font-bold text-neutral-900 truncate">
                                {group.categoryName}
                              </span>
                              <span className="text-[10px] font-bold text-[#b45309] bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                                {group.catalogs.length} Catalogues
                              </span>
                            </button>
                          </td>

                          <td className="py-2.5 px-2.5 sm:px-6 text-right shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleCategoryExpand(group.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF9E15] hover:text-[#b45309] transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <span>{isExpanded ? "Collapse" : "View"}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Individual Catalogue Rows in the EXACT SAME DESIGN */}
                        {isExpanded &&
                          group.catalogs.map((catItem, idx) => {
                            const rawItemName = catItem.name || `${group.categoryName} Volume ${idx + 1}`;

                            return (
                              <tr
                                key={`${group.id}-item-${idx}`}
                                className="hover:bg-amber-50/20 transition-colors group bg-white"
                              >
                                {/* Catalogue Name with Orange Document Icon & 10-char Mobile Truncation */}
                                <td className="py-3 px-2.5 sm:px-6 pl-3.5 sm:pl-10 min-w-0">
                                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                    <div className="hidden sm:flex w-7 h-7 rounded-xs bg-[#FF9E15]/15 text-[#FF9E15] flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4 text-[#FF9E15]" />
                                    </div>
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                      {/* Mobile View: 10 letters then ... */}
                                      <span
                                        className="sm:hidden font-semibold text-neutral-900 block group-hover:text-[#FF9E15] transition-colors"
                                        title={rawItemName}
                                      >
                                        {formatMobileText(rawItemName, 10)}
                                      </span>
                                      {/* Desktop View: Full name */}
                                      <span
                                        className="hidden sm:block font-semibold text-neutral-900 group-hover:text-[#FF9E15] transition-colors truncate max-w-full"
                                        title={rawItemName}
                                      >
                                        {rawItemName}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Pages Count (Hidden on mobile) */}
                                <td className="py-3.5 px-4 sm:px-6 font-medium text-neutral-600 hidden sm:table-cell truncate">
                                  {catItem.pages || `${30 + idx * 10} Pages`}
                                </td>

                                {/* File Size (Hidden on mobile) */}
                                <td className="py-3.5 px-4 sm:px-6 font-medium text-neutral-600 hidden sm:table-cell truncate">
                                  {catItem.file_size || `${(8.5 + idx * 2.1).toFixed(1)} MB`}
                                </td>

                                {/* Direct Download PDF Button for this specific catalogue */}
                                <td className="py-3 px-2.5 sm:px-6 text-right shrink-0">
                                  <a
                                    href={catItem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xs bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-semibold shadow-2xs transition-all duration-200 cursor-pointer whitespace-nowrap"
                                  >
                                    <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                    <span>Download PDF</span>
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
