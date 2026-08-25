"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import {
  Loader2,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
  Package,
  Layers,
  Tag,
  Plus,
  Trash2,
  Monitor,
  Smartphone,
  X,
} from "lucide-react";
import { defaultHeroData, HeroSlide } from "@/lib/hero";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

export default function AdminHeroManagementPage() {
  const {
    heroSlides,
    heroLoading,
    categories,
    products,
    saveHero,
    deleteHero,
  } = useStore();

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [formData, setFormData] = useState<HeroSlide>(defaultHeroData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRefDesktop = useRef<HTMLInputElement>(null);
  const fileInputRefMobile = useRef<HTMLInputElement>(null);

  // Link selector states
  const [linkMode, setLinkMode] = useState<"all_products" | "category" | "product">("all_products");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productFilterCategory, setProductFilterCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  // Sync formData with active slide
  useEffect(() => {
    const currentSlide = heroSlides[activeSlideIndex] || defaultHeroData;
    setFormData({ ...currentSlide });

    // Parse button link mode
    const link = currentSlide.button_link || "";
    if (link.startsWith("/products?category=")) {
      setLinkMode("category");
      setSelectedCategory(link.replace("/products?category=", ""));
    } else if (link.startsWith("/products/")) {
      setLinkMode("product");
      setSelectedProduct(link.replace("/products/", ""));
    } else {
      setLinkMode("all_products");
    }
  }, [activeSlideIndex, heroSlides]);

  // Handle new slide creation
  const handleAddNewSlide = () => {
    const newSlide: HeroSlide = {
      ...defaultHeroData,
      subheading: "",
      title: "",
      image_url: "",
      mobile_image_url: "",
      button_text: "Explore Collection",
      button_link: "/products",
      display_order: heroSlides.length,
    };
    setActiveSlideIndex(heroSlides.length);
    setFormData(newSlide);
    setLinkMode("all_products");
    setStatusMessage({ type: "success", text: "New slide ready to configure. Fill details and click Save." });
  };

  // Helper to delete image from Cloudinary
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

  // Handle slide deletion trigger
  const handleOpenDelete = () => {
    const currentSlide = heroSlides[activeSlideIndex];
    if (!currentSlide?.id) {
      // Unsaved draft: discard cleanly
      setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
      setStatusMessage({ type: "success", text: "Unsaved slide draft discarded." });
      return;
    }
    setShowDeleteModal(true);
  };

  // Confirm delete slide from database & Cloudinary
  const confirmDeleteSlide = async () => {
    const currentSlide = heroSlides[activeSlideIndex];
    if (!currentSlide?.id) return;

    setDeleting(true);
    setStatusMessage(null);
    try {
      // Delete images from Cloudinary
      if (currentSlide.image_url) await deleteFromCloudinary(currentSlide.image_url);
      if (currentSlide.mobile_image_url) await deleteFromCloudinary(currentSlide.mobile_image_url);

      await deleteHero(currentSlide.id);
      setShowDeleteModal(false);
      setActiveSlideIndex(0);
      setStatusMessage({ type: "success", text: "Hero slide deleted successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete slide";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setDeleting(false);
    }
  };

  // Remove Desktop Image
  const handleRemoveDesktopImage = async () => {
    if (!formData.image_url) return;
    const url = formData.image_url;
    setFormData((prev) => ({ ...prev, image_url: "" }));
    await deleteFromCloudinary(url);
    setStatusMessage({ type: "success", text: "Desktop image removed successfully!" });
  };

  // Remove Mobile Image
  const handleRemoveMobileImage = async () => {
    if (!formData.mobile_image_url) return;
    const url = formData.mobile_image_url;
    setFormData((prev) => ({ ...prev, mobile_image_url: "" }));
    await deleteFromCloudinary(url);
    setStatusMessage({ type: "success", text: "Mobile image removed successfully!" });
  };

  // Update button_link whenever link selection changes
  const handleLinkModeChange = (mode: "all_products" | "category" | "product") => {
    setLinkMode(mode);
    if (mode === "all_products") {
      setFormData((prev) => ({ ...prev, button_link: "/products" }));
    } else if (mode === "category") {
      const cat = selectedCategory || "";
      setFormData((prev) => ({ ...prev, button_link: cat ? `/products?category=${cat}` : "/products" }));
    } else if (mode === "product") {
      const prod = selectedProduct || "";
      setFormData((prev) => ({ ...prev, button_link: prod ? `/products/${prod}` : "/products" }));
    }
  };

  const handleCategorySelect = (val: string) => {
    setSelectedCategory(val);
    setFormData((prev) => ({ ...prev, button_link: val ? `/products?category=${val}` : "/products" }));
  };

  const handleProductCategoryFilter = (catVal: string) => {
    setProductFilterCategory(catVal);
    setSelectedProduct("");
    setFormData((prev) => ({ ...prev, button_link: "/products" }));
  };

  const handleProductSelect = (val: string) => {
    setSelectedProduct(val);
    setFormData((prev) => ({ ...prev, button_link: val ? `/products/${val}` : "/products" }));
  };

  const handleInputChange = (field: keyof HeroSlide, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Upload Desktop Image
  const handleDesktopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDesktop(true);
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

      setFormData((prev) => ({ ...prev, image_url: json.url }));
      setStatusMessage({ type: "success", text: "Desktop image uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload desktop image";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingDesktop(false);
    }
  };

  // Upload Mobile Image
  const handleMobileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMobile(true);
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

      setFormData((prev) => ({ ...prev, mobile_image_url: json.url }));
      setStatusMessage({ type: "success", text: "Mobile image uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload mobile image";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingMobile(false);
    }
  };

  // Save Slide
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const payload: HeroSlide = {
        ...formData,
        display_order: activeSlideIndex,
      };
      const saved = await saveHero(payload);
      if (saved) {
        setFormData(saved);
      }
      setStatusMessage({ type: "success", text: `Hero Slide ${activeSlideIndex + 1} saved successfully!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save hero slide";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (heroLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
          <p className="text-sm font-medium text-neutral-500">Loading Hero Section Carousel...</p>
        </div>
      </div>
    );
  }

  // List of slides tabs (including an unsaved new slide if index > heroSlides.length - 1)
  const slidesCount = Math.max(heroSlides.length, activeSlideIndex + 1);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 md:h-screen md:overflow-hidden">
      {/* Reusable Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen overflow-hidden">
        {/* Reusable Top Header Navbar */}
        <AdminHeader title="Hero Section Carousel" />

        {/* Scrollable Content Below Header */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-6xl w-full mx-auto space-y-6">
            {/* Carousel Slide Switcher Tabs */}
            <div className="bg-white rounded-sm border border-neutral-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs font-bold text-black uppercase tracking-wider mr-1">
                  Slides:
                </span>
                {Array.from({ length: slidesCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setActiveSlideIndex(i);
                      setStatusMessage(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                      activeSlideIndex === i
                        ? "bg-[#FF9E15] text-white shadow-xs"
                        : "bg-neutral-100 text-black hover:bg-neutral-200"
                    }`}
                  >
                    Slide {i + 1}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {(heroSlides.length > 1 || activeSlideIndex >= heroSlides.length) && (
                  <button
                    type="button"
                    onClick={handleOpenDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {activeSlideIndex >= heroSlides.length ? "Discard Draft" : `Delete Slide ${activeSlideIndex + 1}`}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAddNewSlide}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FF9E15]" />
                  Add New Slide
                </button>
              </div>
            </div>

            {/* Reusable Top Toast Notification */}
            <AdminToast
              message={statusMessage}
              onClose={() => setStatusMessage(null)}
              duration={3500}
            />

            {/* Slide Management Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Headlines & Text Content Card */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-black">
                   Content & Typography
                  </h3>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                    Active Slide
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Subheading */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Subheading
                    </label>
                    <input
                      type="text"
                      value={formData.subheading}
                      onChange={(e) => handleInputChange("subheading", e.target.value)}
                      placeholder="Enter subheading"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                    <p className="text-[11px] text-neutral-600 mt-1 font-medium">
                      Shown above the main headline
                    </p>
                  </div>

                  {/* Main Title */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Main Headline Title
                    </label>
                    <textarea
                      rows={3}
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter main headline"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Desktop & Mobile Background Images - 2 Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Desktop Hero Image */}
                <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-[#FF9E15]" />
                      <h3 className="text-sm font-bold text-black">Desktop Hero Image</h3>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium">Screen ≥ 768px</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Desktop Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => handleInputChange("image_url", e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Desktop Upload Button */}
                  <div>
                    <input
                      ref={fileInputRefDesktop}
                      type="file"
                      accept="image/*"
                      onChange={handleDesktopImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefDesktop.current?.click()}
                      disabled={uploadingDesktop || Boolean(formData.image_url)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-sm border-2 border-dashed border-neutral-300 hover:border-[#FF9E15] hover:bg-amber-50/30 text-xs font-bold text-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-transparent"
                    >
                      {uploadingDesktop ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#FF9E15]" />
                          Uploading desktop image...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-[#FF9E15]" />
                          Upload Desktop Image
                        </>
                      )}
                    </button>
                  </div>

                  {/* Desktop Thumbnail Preview */}
                  {formData.image_url && (
                    <div className="relative h-36 rounded-sm overflow-hidden border border-neutral-300 bg-neutral-100 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.image_url}
                        alt="Desktop hero preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white font-medium text-[10px] px-2 py-0.5 rounded-sm flex items-center gap-1">
                        <Monitor className="w-3 h-3 text-[#FF9E15]" />
                        Desktop Banner
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDesktopImage}
                        className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white px-2 py-1 rounded-sm shadow-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                        title="Delete image from Cloudinary"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Hero Image */}
                <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#FF9E15]" />
                      <h3 className="text-sm font-bold text-black">Mobile Hero Image</h3>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium">Screen &lt; 768px</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Mobile Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.mobile_image_url || ""}
                      onChange={(e) => handleInputChange("mobile_image_url", e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Mobile Upload Button */}
                  <div>
                    <input
                      ref={fileInputRefMobile}
                      type="file"
                      accept="image/*"
                      onChange={handleMobileImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefMobile.current?.click()}
                      disabled={uploadingMobile || Boolean(formData.mobile_image_url)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-sm border-2 border-dashed border-neutral-300 hover:border-[#FF9E15] hover:bg-amber-50/30 text-xs font-bold text-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-transparent"
                    >
                      {uploadingMobile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#FF9E15]" />
                          Uploading mobile image...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-[#FF9E15]" />
                          Upload Mobile Image
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mobile Thumbnail Preview */}
                  {formData.mobile_image_url ? (
                    <div className="relative h-36 rounded-sm overflow-hidden border border-neutral-300 bg-neutral-100 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.mobile_image_url}
                        alt="Mobile hero preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white font-medium text-[10px] px-2 py-0.5 rounded-sm flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-[#FF9E15]" />
                        Mobile Banner
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveMobileImage}
                        className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white px-2 py-1 rounded-sm shadow-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                        title="Delete image from Cloudinary"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  ) : (
                    formData.image_url && (
                      <div className="relative h-36 rounded-sm overflow-hidden border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center">
                        <span className="text-xs text-neutral-400 font-medium">
                          Using Desktop Banner fallback
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Call to Action Button Card */}
              <div className="w-full bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-black">Call to Action Button</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Button Text */}
                  <div className="lg:col-span-4">
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.button_text}
                      onChange={(e) => handleInputChange("button_text", e.target.value)}
                      placeholder="Enter button name"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Button Destination Link Selector */}
                  <div className="lg:col-span-8 space-y-3">
                    <label className="block text-xs font-bold text-black uppercase tracking-wider">
                      Button Destination Link
                    </label>

                    {/* Mode Selection Tabs (3 Options) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleLinkModeChange("all_products")}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                          linkMode === "all_products"
                            ? "bg-[#FF9E15] text-white shadow-xs"
                            : "bg-neutral-100 text-black hover:bg-neutral-200"
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        Products Page
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkModeChange("category")}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                          linkMode === "category"
                            ? "bg-[#FF9E15] text-white shadow-xs"
                            : "bg-neutral-100 text-black hover:bg-neutral-200"
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        Category
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkModeChange("product")}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                          linkMode === "product"
                            ? "bg-[#FF9E15] text-white shadow-xs"
                            : "bg-neutral-100 text-black hover:bg-neutral-200"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Select Product
                      </button>
                    </div>

                    {/* Mode-Specific Select */}
                    {linkMode === "all_products" && (
                      <div className="p-3 bg-neutral-50 rounded-sm border border-neutral-200 text-xs text-black font-medium flex items-center justify-between">
                        <span>Links directly to all products catalog:</span>
                        <code className="px-2 py-0.5 bg-neutral-200 text-black rounded-sm font-mono text-[11px] font-bold">
                          /products
                        </code>
                      </div>
                    )}

                    {linkMode === "category" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-black">
                          Select Category from Database
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => handleCategorySelect(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all cursor-pointer"
                        >
                          <option value="">-- Select a Category --</option>
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

                    {linkMode === "product" && (
                      <div className="space-y-3">
                        {/* Step 1: Select Category First */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-black">
                            1. Choose Category
                          </label>
                          <select
                            value={productFilterCategory}
                            onChange={(e) => handleProductCategoryFilter(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all cursor-pointer"
                          >
                            <option value="">-- Choose Category --</option>
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
                        </div>

                        {/* Step 2: Select Product from selected category */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-black">
                            2. Choose Product
                          </label>
                          <select
                            disabled={!productFilterCategory}
                            value={selectedProduct}
                            onChange={(e) => handleProductSelect(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {!productFilterCategory
                                ? "-- Please choose category first --"
                                : "-- Select Product --"}
                            </option>
                            {products
                              .filter(
                                (prod) =>
                                  !productFilterCategory ||
                                  prod.category_id === productFilterCategory ||
                                  prod.category === productFilterCategory ||
                                  prod.category?.toLowerCase() === productFilterCategory.toLowerCase()
                              )
                              .map((prod) => (
                                <option key={prod.id} value={prod.slug || prod.id}>
                                  {prod.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Live Resulting Target URL Preview */}
                    <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-sm border border-amber-200/80 text-xs">
                      <span className="font-semibold text-black">Active Link Destination:</span>
                      <code className="px-2 py-0.5 bg-white text-black border border-amber-300 rounded-sm font-mono text-[11px] font-bold">
                        {formData.button_link || "/products"}
                      </code>
                    </div>
                  </div>
                </div>
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
                      Saving Slide {activeSlideIndex + 1}...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Slide {activeSlideIndex + 1}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Delete Hero Slide Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-sm border border-neutral-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5 text-red-600">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-black">Delete Hero Slide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-black">Slide {activeSlideIndex + 1}</span>? This will remove the slide and its associated images from the hero carousel.
            </p>

            {/* Slide Preview Card in Modal */}
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-sm border border-neutral-200">
              <div className="relative w-16 h-12 rounded-sm overflow-hidden bg-neutral-200 shrink-0">
                {formData.image_url || formData.mobile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.image_url || formData.mobile_image_url}
                    alt={formData.title || `Slide ${activeSlideIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Layers className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-black truncate">
                  {formData.title || `Slide ${activeSlideIndex + 1}`}
                </h4>
                {formData.subheading && (
                  <p className="text-[11px] text-neutral-500 font-medium truncate mt-0.5">
                    {formData.subheading}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-sm border border-neutral-300 text-xs font-semibold text-black hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSlide}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Slide
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
