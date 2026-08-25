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
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { WhoWeAreSectionData, WhoWeAreStatItem, defaultWhoWeAreData } from "@/lib/whoWeAre";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

export default function AdminWhoWeArePage() {
  const { whoWeAreData, whoWeAreLoading, saveWhoWeAre } = useStore();

  const [formData, setFormData] = useState<WhoWeAreSectionData>(defaultWhoWeAreData);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingStatIcon, setUploadingStatIcon] = useState(false);
  const [uploadingItemIndex, setUploadingItemIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);

  // New mini stat item state
  const [newStatIconUrl, setNewStatIconUrl] = useState("");
  const [newStatCount, setNewStatCount] = useState("");
  const [newStatLabel, setNewStatLabel] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const statIconInputRef = useRef<HTMLInputElement>(null);
  const itemIconInputRef = useRef<HTMLInputElement>(null);

  // Sync with context
  useEffect(() => {
    if (whoWeAreData) {
      setFormData(whoWeAreData);
    }
  }, [whoWeAreData]);

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

  // Upload main section image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (formData.image_url) {
        await deleteFromCloudinary(formData.image_url);
      }

      setFormData((prev) => ({
        ...prev,
        image_url: json.url,
      }));
      setStatusMessage({ type: "success", text: "Section image uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove main section image
  const handleRemoveImage = async () => {
    if (!formData.image_url) return;
    const oldUrl = formData.image_url;
    setFormData((prev) => ({ ...prev, image_url: "" }));
    await deleteFromCloudinary(oldUrl);
    setStatusMessage({ type: "success", text: "Section image removed." });
  };

  // Upload new stat icon image
  const handleNewStatIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStatIcon(true);
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

      setNewStatIconUrl(json.url);
      setStatusMessage({ type: "success", text: "Icon image uploaded!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload icon image";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingStatIcon(false);
      if (statIconInputRef.current) statIconInputRef.current.value = "";
    }
  };

  // Upload icon image for existing stat item
  const handleItemIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadingItemIndex === null) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const targetIdx = uploadingItemIndex;
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

      const oldIconUrl = formData.stats[targetIdx]?.icon_url;
      if (oldIconUrl) {
        await deleteFromCloudinary(oldIconUrl);
      }

      setFormData((prev) => {
        const newStats = [...prev.stats];
        newStats[targetIdx] = {
          ...newStats[targetIdx],
          icon_url: json.url,
        };
        return { ...prev, stats: newStats };
      });

      setStatusMessage({ type: "success", text: "Card icon updated!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload icon image";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingItemIndex(null);
      if (itemIconInputRef.current) itemIconInputRef.current.value = "";
    }
  };

  // Add mini stat (Max 2 items)
  const handleAddStat = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.stats.length >= 2) {
      setStatusMessage({
        type: "error",
        text: "Maximum 2 mini statistic items allowed. Please remove an existing item first.",
      });
      return;
    }

    if (!newStatCount.trim() || !newStatLabel.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter both a count and a heading label.",
      });
      return;
    }

    const newStat: WhoWeAreStatItem = {
      id: `stat_${Date.now()}`,
      icon_url: newStatIconUrl.trim() || undefined,
      count: newStatCount.trim(),
      label: newStatLabel.trim(),
      display_order: formData.stats.length,
    };

    setFormData((prev) => ({
      ...prev,
      stats: [...prev.stats, newStat],
    }));

    setNewStatIconUrl("");
    setNewStatCount("");
    setNewStatLabel("");
    setStatusMessage({ type: "success", text: "Mini stat item added! Remember to save changes." });
  };

  // Update existing stat field
  const handleUpdateStat = (
    index: number,
    field: "count" | "label",
    val: string
  ) => {
    setFormData((prev) => {
      const newStats = [...prev.stats];
      newStats[index] = {
        ...newStats[index],
        [field]: val,
      };
      return { ...prev, stats: newStats };
    });
  };

  // Remove stat item icon
  const handleRemoveItemIcon = async (index: number) => {
    const iconUrl = formData.stats[index]?.icon_url;
    setFormData((prev) => {
      const newStats = [...prev.stats];
      newStats[index] = {
        ...newStats[index],
        icon_url: undefined,
      };
      return { ...prev, stats: newStats };
    });
    if (iconUrl) {
      await deleteFromCloudinary(iconUrl);
    }
  };

  // Remove mini stat item
  const handleRemoveStat = async (index: number) => {
    const item = formData.stats[index];
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
    if (item?.icon_url) {
      await deleteFromCloudinary(item.icon_url);
    }
    setStatusMessage({ type: "success", text: "Mini stat removed." });
  };

  // Reorder mini stat
  const handleMoveStat = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.stats.length) return;

    setFormData((prev) => {
      const newStats = [...prev.stats];
      const temp = newStats[index];
      newStats[index] = newStats[targetIndex];
      newStats[targetIndex] = temp;
      return { ...prev, stats: newStats };
    });
  };

  // Save changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const saved = await saveWhoWeAre(formData);
      if (saved) {
        setFormData(saved);
      }
      setStatusMessage({ type: "success", text: "Who We Are Section saved successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save who we are section";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (whoWeAreLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
          <p className="text-sm font-medium text-neutral-500">Loading Who We Are Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 md:h-screen md:overflow-hidden">
      {/* Reusable Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen overflow-hidden">
        {/* Reusable Top Header */}
        <AdminHeader title="Who We Are Section Management" />

        {/* Reusable Top Center Toast */}
        <AdminToast
          message={statusMessage}
          onClose={() => setStatusMessage(null)}
          duration={3500}
        />

        {/* Hidden inputs for icon uploads */}
        <input
          ref={statIconInputRef}
          type="file"
          accept="image/*"
          onChange={handleNewStatIconUpload}
          className="hidden"
        />
        <input
          ref={itemIconInputRef}
          type="file"
          accept="image/*"
          onChange={handleItemIconUpload}
          className="hidden"
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-5xl w-full mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Image Card */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-black">
                    Section Image
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  {/* Image Preview */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center">
                    {formData.image_url ? (
                      <div className="relative w-full h-56 rounded-sm border border-neutral-200 overflow-hidden bg-neutral-50 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.image_url}
                          alt="Who We Are Featured"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-sm shadow-md transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-56 border-2 border-dashed border-neutral-200 rounded-sm flex flex-col items-center justify-center text-neutral-400 gap-2 p-4 text-center">
                        <ImageIcon className="w-10 h-10 text-neutral-300" />
                        <span className="text-xs font-medium">No image uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="sm:col-span-7 space-y-3">
                    <span className="block text-xs font-bold text-black uppercase tracking-wider">
                      Upload Featured Image
                    </span>
                    <p className="text-xs text-neutral-500">
                      Upload a high-quality vertical/square lifestyle image for the left side of the section.
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer disabled:opacity-60"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading Image...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {formData.image_url ? "Change Image" : "Upload Image"}
                          </>
                        )}
                      </button>

                      {formData.image_url && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-sm text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text & Content Card */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-black">
                    Content & Headings
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Enter Subtitle"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Main Heading */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Main Heading
                    </label>
                    <input
                      type="text"
                      value={formData.heading || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heading: e.target.value }))}
                      placeholder="Enter Main Heading"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter Description"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Button Info */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Button Name
                    </label>
                    <input
                      type="text"
                      value={formData.button_text || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, button_text: e.target.value, button_link: prev.button_link || "/contact" }))}
                      placeholder="Enter Button Name"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Mini Stats (Second image section) Card */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-black">
                      Mini Statistics Section
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Display metric cards with icon image, count, and heading below the description
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <label className="inline-flex items-center cursor-pointer gap-2.5">
                    <span className="text-xs font-semibold text-neutral-700">
                      {formData.show_stats ? "ON" : "OFF"}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.show_stats}
                        onChange={(e) => setFormData((prev) => ({ ...prev, show_stats: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF9E15]"></div>
                    </div>
                  </label>
                </div>

                {formData.show_stats && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Add New Mini Stat Form (Limit to 2 items) */}
                    {formData.stats.length < 2 ? (
                      <div className="p-4 bg-neutral-50 rounded-sm border border-neutral-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-black uppercase tracking-wider block">
                            Add New Mini Stat Card
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {formData.stats.length}/2 items
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          {/* Icon Image Upload */}
                          <div className="sm:col-span-4">
                            <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                              Icon Image
                            </label>
                            <div className="flex items-center gap-2">
                              {newStatIconUrl ? (
                                <div className="relative w-10 h-10 rounded-sm border border-neutral-200 bg-white p-1 flex items-center justify-center shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={newStatIconUrl}
                                    alt="Icon preview"
                                    className="w-full h-full object-contain"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setNewStatIconUrl("")}
                                    className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xs cursor-pointer"
                                    title="Remove icon"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => statIconInputRef.current?.click()}
                                disabled={uploadingStatIcon}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 transition-all cursor-pointer h-[38px] disabled:opacity-60"
                              >
                                {uploadingStatIcon ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF9E15]" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5 text-neutral-500" />
                                    {newStatIconUrl ? "Change Icon" : "Upload Icon"}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Count */}
                          <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                              Count
                            </label>
                            <input
                              type="text"
                              value={newStatCount}
                              onChange={(e) => setNewStatCount(e.target.value)}
                              placeholder="Enter Count"
                              className="w-full px-3 py-2 text-xs rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent h-[38px]"
                            />
                          </div>

                          {/* Heading / Label */}
                          <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                              Heading
                            </label>
                            <input
                              type="text"
                              value={newStatLabel}
                              onChange={(e) => setNewStatLabel(e.target.value)}
                              placeholder="Enter Heading"
                              className="w-full px-3 py-2 text-xs rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent h-[38px]"
                            />
                          </div>

                          {/* Add Button */}
                          <div className="sm:col-span-2">
                            <button
                              type="button"
                              onClick={handleAddStat}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer h-[38px]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-neutral-50 rounded-sm border border-neutral-200 text-center">
                        <p className="text-xs text-neutral-600 font-medium">
                          Maximum limit of 2 mini statistics items reached (2/2). You can edit or remove items below.
                        </p>
                      </div>
                    )}

                    {/* Existing Mini Stats List */}
                    {formData.stats.length === 0 ? (
                      <div className="p-6 border border-dashed border-neutral-200 rounded-sm text-center text-neutral-400 space-y-1">
                        <p className="text-xs font-medium">No mini statistics added yet.</p>
                        <p className="text-[11px]">
                          Add up to 2 cards above (e.g. Projects, Professionals) to display below the text.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.stats.map((stat, idx) => (
                          <div
                            key={stat.id || idx}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 bg-neutral-50/80 hover:bg-neutral-50 border border-neutral-200 rounded-sm transition-all"
                          >
                            <span className="text-xs font-mono text-neutral-400 w-5 text-center shrink-0">
                              {idx + 1}
                            </span>

                            {/* Icon Image */}
                            <div className="w-full sm:w-36 shrink-0 flex items-center gap-2">
                              {stat.icon_url ? (
                                <div className="relative w-8 h-8 rounded-sm border border-neutral-200 bg-white p-1 flex items-center justify-center shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={stat.icon_url}
                                    alt="Icon"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-sm border border-dashed border-neutral-200 bg-white flex items-center justify-center text-neutral-300 shrink-0">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setUploadingItemIndex(idx);
                                  itemIconInputRef.current?.click();
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-sm cursor-pointer"
                              >
                                {stat.icon_url ? "Change" : "Upload"}
                              </button>

                              {stat.icon_url && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemIcon(idx)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm cursor-pointer"
                                  title="Remove icon image"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Count */}
                            <div className="w-full sm:w-28 shrink-0">
                              <input
                                type="text"
                                value={stat.count}
                                onChange={(e) => handleUpdateStat(idx, "count", e.target.value)}
                                placeholder="Enter Count"
                                className="w-full px-2.5 py-1.5 text-xs font-bold rounded-sm border border-neutral-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF9E15]"
                              />
                            </div>

                            {/* Heading */}
                            <div className="flex-1">
                              <input
                                type="text"
                                value={stat.label}
                                onChange={(e) => handleUpdateStat(idx, "label", e.target.value)}
                                placeholder="Enter Heading"
                                className="w-full px-2.5 py-1.5 text-xs rounded-sm border border-neutral-300 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9E15]"
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200">
                              <button
                                type="button"
                                onClick={() => handleMoveStat(idx, "up")}
                                disabled={idx === 0}
                                className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveStat(idx, "down")}
                                disabled={idx === formData.stats.length - 1}
                                className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveStat(idx)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer ml-1"
                                title="Delete mini stat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                      Saving Who We Are Section...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Who We Are Section
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
