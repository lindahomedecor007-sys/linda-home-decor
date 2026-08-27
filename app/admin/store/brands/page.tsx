"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import {
  Loader2,
  Upload,
  Save,
  Trash2,
  Plus,
  ImageIcon,
  Sparkles,
  Layers,
} from "lucide-react";
import { BrandsSectionData, BrandItem, defaultBrandsData } from "@/lib/brands";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

export default function AdminBrandsManagementPage() {
  const { brandsData, brandsLoading, saveBrands } = useStore();

  const [formData, setFormData] = useState<BrandsSectionData>(() => brandsData || defaultBrandsData);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);

  const [newBrandName, setNewBrandName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with context if it updates
  useEffect(() => {
    if (brandsData) {
      setFormData(brandsData);
    }
  }, [brandsData]);

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

  // Upload Brand Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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

      const newBrand: BrandItem = {
        id: `brand_${Date.now()}`,
        name: newBrandName.trim() || undefined,
        image_url: json.url,
      };

      setFormData((prev) => ({
        ...prev,
        brands: [...prev.brands, newBrand],
      }));
      setNewBrandName("");
      setStatusMessage({ type: "success", text: "Brand logo uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload brand logo";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove Brand Logo
  const handleRemoveBrand = async (index: number) => {
    const brandToRemove = formData.brands[index];
    if (!brandToRemove) return;

    setFormData((prev) => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index),
    }));

    if (brandToRemove.image_url) {
      await deleteFromCloudinary(brandToRemove.image_url);
    }
    setStatusMessage({ type: "success", text: "Brand logo removed successfully!" });
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const saved = await saveBrands(formData);
      if (saved) {
        setFormData(saved);
      }
      setStatusMessage({ type: "success", text: "Brands Section saved successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save brands section";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Reusable Top Header */}
      <AdminHeader title="Brands Section Management" />

      {/* Reusable Top Center Toast */}
      <AdminToast
        message={statusMessage}
        onClose={() => setStatusMessage(null)}
        duration={3500}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {brandsLoading && !brandsData ? (
            <div className="max-w-5xl w-full mx-auto bg-white rounded-sm border border-neutral-200 p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15] mx-auto" />
              <p className="text-sm font-medium text-neutral-500">Loading Brands Settings...</p>
            </div>
          ) : (
            <div className="max-w-5xl w-full mx-auto space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Headings Card */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-black flex items-center gap-2">
                    Brands Header & Titles
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sub Title */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.sub_title || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sub_title: e.target.value }))}
                      placeholder="Enter Subtitle"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                      Small text positioned directly above the main heading
                    </p>
                  </div>

                  {/* Main Heading */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Main Heading Title
                    </label>
                    <input
                      type="text"
                      value={formData.heading || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heading: e.target.value }))}
                      placeholder="Enter Main Heading Title"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                      Primary prominent section title
                    </p>
                  </div>
                </div>
              </div>

              {/* Brand Logos Management Card */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-black flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#FF9E15]" />
                    Brand Logos Grid ({formData.brands.length})
                  </h3>
                </div>

                {/* Upload New Brand Logo Form Bar */}
                <div className="p-4 bg-neutral-50 rounded-sm border border-neutral-200 space-y-3">
                  <span className="text-xs font-bold text-black uppercase tracking-wider block">
                    Add New Brand Logo
                  </span>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="Brand Name (e.g. Interface, Bruce, Mohawk)"
                      className="flex-1 px-3.5 py-2 text-xs rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent"
                    />

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer disabled:opacity-60"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          Upload Logo Image
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Uploaded Brands Grid */}
                {formData.brands.length === 0 ? (
                  <div className="p-8 border border-dashed border-neutral-200 rounded-sm text-center text-neutral-400 space-y-1">
                    <ImageIcon className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="text-xs font-medium">No brand logos added yet.</p>
                    <p className="text-[11px]">Upload logos above to display on the brands section grid.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {formData.brands.map((brand, idx) => (
                      <div
                        key={brand.id || idx}
                        className="relative h-28 bg-white border border-neutral-200 rounded-sm p-3 flex flex-col items-center justify-center group hover:border-[#FF9E15] transition-all shadow-2xs"
                      >
                        {/* Brand Logo */}
                        <div className="w-full h-16 flex items-center justify-center overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={brand.image_url}
                            alt={brand.name || `Brand ${idx + 1}`}
                            className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                          />
                        </div>

                        {/* Brand Name */}
                        {brand.name && (
                          <span className="text-[11px] font-semibold text-neutral-800 mt-1 truncate w-full text-center">
                            {brand.name}
                          </span>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveBrand(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-sm shadow-xs transition-colors cursor-pointer"
                          title="Delete logo from Cloudinary"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Save Button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm text-sm font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-md transition-all disabled:opacity-60 cursor-pointer active:scale-98"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Brands Section...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Brands Section
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
