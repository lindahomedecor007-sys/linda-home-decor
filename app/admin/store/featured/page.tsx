"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import {
  Loader2,
  Upload,
  Save,
  Trash2,
  Package,
  Layers,
  Tag,
  ImageIcon,
} from "lucide-react";
import { defaultFeaturedData, FeaturedSectionData, FeaturedBlock } from "@/lib/featured";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

interface BlockLinkState {
  mode: "all_products" | "category" | "product";
  category: string;
  filterCategory: string;
  product: string;
}

export default function AdminFeaturedManagementPage() {
  const {
    featuredData,
    featuredLoading,
    categories,
    products,
    saveFeatured,
  } = useStore();

  const [formData, setFormData] = useState<FeaturedSectionData>(() => featuredData || defaultFeaturedData);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Individual link states for each of the 4 blocks
  const [linkStates, setLinkStates] = useState<[BlockLinkState, BlockLinkState, BlockLinkState, BlockLinkState]>([
    { mode: "all_products", category: "", filterCategory: "", product: "" },
    { mode: "all_products", category: "", filterCategory: "", product: "" },
    { mode: "all_products", category: "", filterCategory: "", product: "" },
    { mode: "all_products", category: "", filterCategory: "", product: "" },
  ]);

  // Sync with context data
  useEffect(() => {
    if (featuredData) {
      setFormData(featuredData);

      const parsedLinkStates: [BlockLinkState, BlockLinkState, BlockLinkState, BlockLinkState] = [
        parseLink(featuredData.items[0]?.link),
        parseLink(featuredData.items[1]?.link),
        parseLink(featuredData.items[2]?.link),
        parseLink(featuredData.items[3]?.link),
      ];
      setLinkStates(parsedLinkStates);
    }
  }, [featuredData]);

  function parseLink(link?: string): BlockLinkState {
    const l = link || "/products";
    if (l.startsWith("/products?category=")) {
      return {
        mode: "category",
        category: l.replace("/products?category=", ""),
        filterCategory: "",
        product: "",
      };
    }
    if (l.startsWith("/products/")) {
      return {
        mode: "product",
        category: "",
        filterCategory: "",
        product: l.replace("/products/", ""),
      };
    }
    return { mode: "all_products", category: "", filterCategory: "", product: "" };
  }

  // Helper to delete from Cloudinary
  const deleteFromCloudinary = async (url?: string) => {
    if (!url || !url.includes("cloudinary.com")) return;
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch (err) {
      console.error("Failed to delete image from Cloudinary:", err);
    }
  };

  // Handle block link mode changes
  const handleLinkModeChange = (index: number, mode: "all_products" | "category" | "product") => {
    setLinkStates((prev) => {
      const next = [...prev] as [BlockLinkState, BlockLinkState, BlockLinkState, BlockLinkState];
      next[index] = { ...next[index], mode };
      return next;
    });

    let targetLink = "/products";
    if (mode === "category") {
      const cat = linkStates[index].category;
      targetLink = cat ? `/products?category=${cat}` : "/products";
    } else if (mode === "product") {
      const prod = linkStates[index].product;
      targetLink = prod ? `/products/${prod}` : "/products";
    }
    updateItemField(index, "link", targetLink);
  };

  const handleCategorySelect = (index: number, val: string) => {
    setLinkStates((prev) => {
      const next = [...prev] as [BlockLinkState, BlockLinkState, BlockLinkState, BlockLinkState];
      next[index] = { ...next[index], category: val };
      return next;
    });
    updateItemField(index, "link", val ? `/products?category=${val}` : "/products");
  };

  const handleProductCategoryFilter = (index: number, catVal: string) => {
    setLinkStates((prev) => {
      const next = [...prev] as [BlockLinkState, BlockLinkState, BlockLinkState, BlockLinkState];
      next[index] = { ...next[index], filterCategory: catVal, product: "" };
      return next;
    });
    updateItemField(index, "link", "/products");
  };

  const handleProductSelect = (index: number, val: string) => {
    setLinkStates((prev) => {
      const next = [...prev] as [BlockLinkState, BlockLinkState, BlockLinkState, BlockLinkState];
      next[index] = { ...next[index], product: val };
      return next;
    });
    updateItemField(index, "link", val ? `/products/${val}` : "/products");
  };

  const updateItemField = (index: number, field: keyof FeaturedBlock, value: string) => {
    setFormData((prev) => {
      const newItems = [...prev.items] as [FeaturedBlock, FeaturedBlock, FeaturedBlock, FeaturedBlock];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // Upload image for a block
  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    setStatusMessage(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      updateItemField(index, "image_url", json.url);
      setStatusMessage({ type: "success", text: `Item ${index + 1} image uploaded successfully!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingIndex(null);
    }
  };

  // Remove image from a block
  const handleRemoveImage = async (index: number) => {
    const url = formData.items[index]?.image_url;
    if (!url) return;

    updateItemField(index, "image_url", "");
    await deleteFromCloudinary(url);
    setStatusMessage({ type: "success", text: `Item ${index + 1} image removed successfully!` });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const saved = await saveFeatured(formData);
      if (saved) {
        setFormData(saved);
      }
      setStatusMessage({ type: "success", text: "Featured Section saved successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save featured section";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Reusable Top Header Navbar */}
      <AdminHeader title="Featured Section Management" />

      {/* Reusable Top Center Toast */}
      <AdminToast
        message={statusMessage}
        onClose={() => setStatusMessage(null)}
        duration={3500}
      />

      {/* Scrollable Content Below Header */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {featuredLoading && !featuredData ? (
            <div className="max-w-6xl w-full mx-auto bg-white rounded-sm border border-neutral-200 p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15] mx-auto" />
              <p className="text-sm font-medium text-neutral-500">Loading Featured Section Settings...</p>
            </div>
          ) : (
            <div className="max-w-6xl w-full mx-auto space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Header Card */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-black">
                    Featured Section Heading
                  </h3>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                    4-Grid Display
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={formData.heading}
                    onChange={(e) => setFormData((prev) => ({ ...prev, heading: e.target.value }))}
                    placeholder="Enter Section Title"
                    className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                    Shown at the top of the 4 featured product/category blocks
                  </p>
                </div>
              </div>

              {/* 4 Featured Items (2x2 Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {formData.items.map((item, index) => {
                  const linkState = linkStates[index];
                  const fileInput = fileInputRefs[index];
                  const isUploading = uploadingIndex === index;

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#FF9E15] text-white flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <h3 className="text-sm font-bold text-black">
                            Featured Item {index + 1}
                          </h3>
                        </div>
                      </div>

                      {/* Item Title */}
                      <div>
                        <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                          Display Title
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItemField(index, "title", e.target.value)}
                          placeholder="Enter Display Title"
                          className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Image Upload & Preview */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-black uppercase tracking-wider">
                          Item Image
                        </label>

                        <div>
                          <input
                            type="url"
                            value={item.image_url}
                            onChange={(e) => updateItemField(index, "image_url", e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3.5 py-2 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                          />
                        </div>

                        {/* File Upload Button */}
                        <div>
                          <input
                            ref={fileInput}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(index, e)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInput.current?.click()}
                            disabled={isUploading || Boolean(item.image_url)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border-2 border-dashed border-neutral-300 hover:border-[#FF9E15] hover:bg-amber-50/30 text-xs font-bold text-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-transparent"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-[#FF9E15]" />
                                Uploading Image...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-[#FF9E15]" />
                                Upload Image
                              </>
                            )}
                          </button>
                        </div>

                        {/* Thumbnail Preview with Remove Button */}
                        {item.image_url ? (
                          <div className="relative h-40 rounded-sm overflow-hidden border border-neutral-300 bg-neutral-100 group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image_url}
                              alt={item.title || `Item ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white px-2 py-1 rounded-sm shadow-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                              title="Delete image from Cloudinary"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="h-28 rounded-sm border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center text-neutral-400 gap-1.5">
                            <ImageIcon className="w-5 h-5 text-neutral-300" />
                            <span className="text-[11px] font-medium">No image uploaded</span>
                          </div>
                        )}
                      </div>

                      {/* Click Redirect Link Selector */}
                      <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                        <label className="block text-xs font-bold text-black uppercase tracking-wider">
                          Click Destination Link
                        </label>

                        {/* Mode Selection Tabs (3 Options) */}
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLinkModeChange(index, "all_products")}
                            className={`flex items-center justify-center gap-1 py-1.5 rounded-sm text-[11px] font-bold transition-all cursor-pointer ${
                              linkState.mode === "all_products"
                                ? "bg-[#FF9E15] text-white shadow-xs"
                                : "bg-neutral-100 text-black hover:bg-neutral-200"
                            }`}
                          >
                            <Package className="w-3 h-3" />
                            Products
                          </button>

                          <button
                            type="button"
                            onClick={() => handleLinkModeChange(index, "category")}
                            className={`flex items-center justify-center gap-1 py-1.5 rounded-sm text-[11px] font-bold transition-all cursor-pointer ${
                              linkState.mode === "category"
                                ? "bg-[#FF9E15] text-white shadow-xs"
                                : "bg-neutral-100 text-black hover:bg-neutral-200"
                            }`}
                          >
                            <Tag className="w-3 h-3" />
                            Category
                          </button>

                          <button
                            type="button"
                            onClick={() => handleLinkModeChange(index, "product")}
                            className={`flex items-center justify-center gap-1 py-1.5 rounded-sm text-[11px] font-bold transition-all cursor-pointer ${
                              linkState.mode === "product"
                                ? "bg-[#FF9E15] text-white shadow-xs"
                                : "bg-neutral-100 text-black hover:bg-neutral-200"
                            }`}
                          >
                            <Layers className="w-3 h-3" />
                            Product
                          </button>
                        </div>

                        {/* Mode-Specific Dropdowns */}
                        {linkState.mode === "all_products" && (
                          <div className="p-2 bg-neutral-50 rounded-sm border border-neutral-200 text-xs text-black font-medium flex items-center justify-between">
                            <span className="text-[11px]">Links to all products:</span>
                            <code className="px-1.5 py-0.5 bg-neutral-200 text-black rounded-sm font-mono text-[10px] font-bold">
                              /products
                            </code>
                          </div>
                        )}

                        {linkState.mode === "category" && (
                          <div className="space-y-1">
                            <select
                              value={linkState.category}
                              onChange={(e) => handleCategorySelect(index, e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all cursor-pointer"
                            >
                              <option value="">-- Select Category from Database --</option>
                              {categories.length > 0 ? (
                                categories.map((cat) => (
                                  <option key={cat.id} value={cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")}>
                                    {cat.name}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  No categories found in database
                                </option>
                              )}
                            </select>
                          </div>
                        )}

                        {linkState.mode === "product" && (
                          <div className="space-y-2">
                            {/* Step 1: Filter category */}
                            <select
                              value={linkState.filterCategory}
                              onChange={(e) => handleProductCategoryFilter(index, e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all cursor-pointer"
                            >
                              <option value="">-- Step 1: Choose Category --</option>
                              {categories.length > 0 ? (
                                categories.map((cat) => (
                                  <option key={cat.id} value={cat.id || cat.slug}>
                                    {cat.name}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  No categories found in database
                                </option>
                              )}
                            </select>

                            {/* Step 2: Choose product */}
                            <select
                              disabled={!linkState.filterCategory}
                              value={linkState.product}
                              onChange={(e) => handleProductSelect(index, e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">
                                {!linkState.filterCategory
                                  ? "-- Choose category first --"
                                  : "-- Step 2: Select Product --"}
                              </option>
                              {products
                                .filter(
                                  (prod) =>
                                    !linkState.filterCategory ||
                                    prod.category_id === linkState.filterCategory ||
                                    prod.category === linkState.filterCategory ||
                                    prod.category?.toLowerCase() === linkState.filterCategory.toLowerCase()
                                )
                                .map((prod) => (
                                  <option key={prod.id} value={prod.slug || prod.id}>
                                    {prod.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}

                        {/* Active Link Destination Pill */}
                        <div className="flex items-center justify-between p-2 bg-amber-50/60 rounded-sm border border-amber-200/80 text-[11px]">
                          <span className="font-semibold text-black">Active Link:</span>
                          <code className="px-1.5 py-0.5 bg-white text-black border border-amber-300 rounded-sm font-mono text-[10px] font-bold truncate max-w-[180px]">
                            {item.link || "/products"}
                          </code>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Bar */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm text-sm font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-md transition-all disabled:opacity-60 cursor-pointer active:scale-98"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Featured Section...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Featured Section
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          )}
        </div>
    </>
  );
}
