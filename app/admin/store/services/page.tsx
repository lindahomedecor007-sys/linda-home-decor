"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
  Sparkles,
  RotateCcw,
  Layers,
} from "lucide-react";
import { ServicesSectionData, ServiceItem, defaultServicesData } from "@/lib/services";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

const DRAFT_STORAGE_KEY = "linda_services_section_draft";

export default function AdminServicesPage() {
  const { servicesData, servicesLoading, saveServices } = useStore();

  const [formData, setFormData] = useState<ServicesSectionData>(defaultServicesData);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingNewIcon, setUploadingNewIcon] = useState(false);
  const [uploadingItemIndex, setUploadingItemIndex] = useState<number | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);

  // New service item form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIconUrl, setNewIconUrl] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const newIconInputRef = useRef<HTMLInputElement>(null);
  const editIconInputRef = useRef<HTMLInputElement>(null);

  // Sync state from context & restore any unsaved draft
  useEffect(() => {
    if (servicesLoading) return;

    let restoredFromDraft = false;
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === "object") {
            setFormData({
              ...(servicesData || defaultServicesData),
              ...parsed,
              id: servicesData?.id || parsed.id,
            });
            setHasDraft(true);
            restoredFromDraft = true;
          }
        } catch {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      }
    }

    if (!restoredFromDraft && servicesData) {
      setFormData(servicesData);
    }
  }, [servicesData, servicesLoading]);

  // Real-time draft auto-save
  const persistDraft = (updated: ServicesSectionData) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
        setHasDraft(true);
      } catch {
        // Storage quota
      }
    }
  };

  const handleHeadingChange = (value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, heading: value };
      persistDraft(updated);
      return updated;
    });
  };

  const handleDiscardDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    setHasDraft(false);
    setFormData(servicesData || defaultServicesData);
    setStatusMessage({
      type: "info",
      text: "Unsaved draft discarded. Reset to database version.",
    });
  };

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

  // Upload background banner image
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
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

      if (formData.banner_image_url) {
        await deleteFromCloudinary(formData.banner_image_url);
      }

      setFormData((prev) => {
        const updated = { ...prev, banner_image_url: json.url };
        persistDraft(updated);
        return updated;
      });
      setStatusMessage({ type: "success", text: "Background banner uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload banner";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  // Remove background banner
  const handleRemoveBanner = async () => {
    if (!formData.banner_image_url) return;
    const oldUrl = formData.banner_image_url;
    setFormData((prev) => {
      const updated = { ...prev, banner_image_url: "" };
      persistDraft(updated);
      return updated;
    });
    await deleteFromCloudinary(oldUrl);
    setStatusMessage({ type: "success", text: "Background banner removed." });
  };

  // Upload icon for a new service item
  const handleNewIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNewIcon(true);
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

      setNewIconUrl(json.url);
      setStatusMessage({ type: "success", text: "Service icon uploaded!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload icon";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingNewIcon(false);
      if (newIconInputRef.current) newIconInputRef.current.value = "";
    }
  };

  // Add new service item
  const handleAddService = () => {
    if (!newTitle.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a service heading/title." });
      return;
    }

    const newItem: ServiceItem = {
      id: "srv_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      title: newTitle.trim(),
      description: newDescription.trim(),
      icon_url: newIconUrl || undefined,
      display_order: formData.services.length + 1,
    };

    setFormData((prev) => {
      const updated = {
        ...prev,
        services: [...prev.services, newItem],
      };
      persistDraft(updated);
      return updated;
    });

    setNewTitle("");
    setNewDescription("");
    setNewIconUrl("");
    setIsAddingItem(false);
    setStatusMessage({ type: "success", text: "New service added to list!" });
  };

  // Update existing service item
  const handleUpdateServiceItem = (index: number, field: keyof ServiceItem, value: string) => {
    setFormData((prev) => {
      const updatedServices = [...prev.services];
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value,
      };
      const updated = { ...prev, services: updatedServices };
      persistDraft(updated);
      return updated;
    });
  };

  // Upload replacement icon for existing service item
  const handleEditIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingItemIndex(index);
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

      const oldIcon = formData.services[index]?.icon_url;
      if (oldIcon) await deleteFromCloudinary(oldIcon);

      handleUpdateServiceItem(index, "icon_url", json.url);
      setStatusMessage({ type: "success", text: "Icon updated successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload icon";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingItemIndex(null);
      if (editIconInputRef.current) editIconInputRef.current.value = "";
    }
  };

  // Remove icon from existing service item
  const handleRemoveItemIcon = async (index: number) => {
    const oldIcon = formData.services[index]?.icon_url;
    handleUpdateServiceItem(index, "icon_url", "");
    if (oldIcon) await deleteFromCloudinary(oldIcon);
    setStatusMessage({ type: "success", text: "Icon removed." });
  };

  // Delete service item
  const handleDeleteService = async (index: number) => {
    const itemToDelete = formData.services[index];
    if (itemToDelete?.icon_url) {
      await deleteFromCloudinary(itemToDelete.icon_url);
    }

    setFormData((prev) => {
      const updatedServices = prev.services.filter((_, i) => i !== index);
      const updated = { ...prev, services: updatedServices };
      persistDraft(updated);
      return updated;
    });
    setStatusMessage({ type: "success", text: "Service removed." });
  };

  // Move service item order up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const list = [...prev.services];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      const updated = { ...prev, services: list };
      persistDraft(updated);
      return updated;
    });
  };

  // Move service item order down
  const handleMoveDown = (index: number) => {
    if (index === formData.services.length - 1) return;
    setFormData((prev) => {
      const list = [...prev.services];
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      const updated = { ...prev, services: list };
      persistDraft(updated);
      return updated;
    });
  };

  // Save to Database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      await saveServices(formData);
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setHasDraft(false);
      setStatusMessage({
        type: "success",
        text: "Services section saved successfully to database!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save services section";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
          <p className="text-sm font-medium text-neutral-500">Loading Services Section...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 md:h-screen md:overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 md:h-screen overflow-hidden">
        <AdminHeader title="Services Section" />

        <AdminToast
          message={statusMessage}
          onClose={() => setStatusMessage(null)}
          duration={3500}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            {/* Header / Summary Card */}
            <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-black flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FF9E15]" />
                  Services Section
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                  Configure the Services section banner, common heading, and services list shown on the Services page
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* 1. Background Banner Upload */}
              <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                      1. Background Banner Image (Half-Screen Top Banner)
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      This image is displayed across the top half of the screen on the Services page.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.banner_image_url ? (
                    <div className="relative w-full h-56 sm:h-72 rounded-sm overflow-hidden border border-neutral-200 group bg-neutral-900">
                      <Image
                        src={formData.banner_image_url}
                        alt="Services Banner"
                        fill
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleRemoveBanner}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-sm shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-300 hover:border-[#FF9E15] bg-neutral-50 hover:bg-neutral-100/60 transition-all rounded-sm p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-400">
                        {uploadingBanner ? (
                          <Loader2 className="w-6 h-6 animate-spin text-[#FF9E15]" />
                        ) : (
                          <ImageIcon className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-neutral-800">
                          {uploadingBanner ? "Uploading banner..." : "Click to upload banner image"}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          High resolution landscape image recommended (1920x800)
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 2. Common Heading */}
              <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                    2. Common Heading
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    The primary heading shown inside the background banner image.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Page / Section Heading
                  </label>
                  <input
                    type="text"
                    value={formData.heading || ""}
                    onChange={(e) => handleHeadingChange(e.target.value)}
                    placeholder="e.g. Our Services, Premium Interior Solutions"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-sm text-sm text-neutral-900 focus:outline-none focus:border-[#FF9E15] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* 3. Services Listing Manager */}
              <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                      <span>3. Services List</span>
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-neutral-100 text-neutral-700 rounded-full border border-neutral-200">
                        {formData.services.length} Added
                      </span>
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Add, edit, or reorder individual services with custom icons, titles, and descriptions.
                    </p>
                  </div>

                  {!isAddingItem && (
                    <button
                      type="button"
                      onClick={() => setIsAddingItem(true)}
                      className="px-3.5 py-1.5 bg-[#FF9E15] hover:bg-[#e0890f] text-white text-xs font-semibold rounded-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Service
                    </button>
                  )}
                </div>

                {/* Add New Service Panel */}
                {isAddingItem && (
                  <div className="p-4 sm:p-5 bg-neutral-50 rounded-sm border border-[#FF9E15]/50 shadow-xs space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#FF9E15] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Add New Service
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingItem(false);
                          setNewTitle("");
                          setNewDescription("");
                          setNewIconUrl("");
                        }}
                        className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {/* Icon Upload (3 cols) */}
                      <div className="sm:col-span-3 flex flex-col items-center justify-center">
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 text-center">
                          Service Icon
                        </label>
                        {newIconUrl ? (
                          <div className="relative w-20 h-20 rounded-sm overflow-hidden bg-white border border-neutral-300 shadow-xs flex items-center justify-center group p-1">
                            <Image
                              src={newIconUrl}
                              alt="Icon"
                              width={50}
                              height={50}
                              className="object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setNewIconUrl("")}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 hover:text-red-300 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => newIconInputRef.current?.click()}
                            disabled={uploadingNewIcon}
                            className="w-20 h-20 rounded-sm border border-dashed border-neutral-300 hover:border-[#FF9E15] bg-white flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer shadow-xs"
                          >
                            {uploadingNewIcon ? (
                              <Loader2 className="w-5 h-5 animate-spin text-[#FF9E15]" />
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-[#FF9E15]" />
                                <span className="text-[10px] font-medium text-neutral-600">Upload</span>
                              </>
                            )}
                          </button>
                        )}
                        <input
                          ref={newIconInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleNewIconUpload}
                          className="hidden"
                        />
                      </div>

                      {/* Title and Description (9 cols) */}
                      <div className="sm:col-span-9 space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                            Service Title / Heading <span className="text-[#FF9E15]">*</span>
                          </label>
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="e.g. Interior Design, Custom Furniture, Wall Paneling"
                            className="w-full px-3.5 py-2 bg-white border border-neutral-300 rounded-sm text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#FF9E15]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                            Service Description
                          </label>
                          <textarea
                            rows={2}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Detailed summary of this service..."
                            className="w-full px-3.5 py-2 bg-white border border-neutral-300 rounded-sm text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#FF9E15] resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setIsAddingItem(false)}
                        className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium rounded-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddService}
                        className="px-4 py-1.5 bg-[#FF9E15] hover:bg-[#e0890f] text-white text-xs font-semibold rounded-sm shadow-xs transition-colors cursor-pointer"
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                )}

                {/* Service Items List */}
                {formData.services.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-50 rounded-sm border border-dashed border-neutral-200">
                    <Layers className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">No services added yet</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Click &quot;Add Service&quot; above to add your first service.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.services.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="p-4 bg-white rounded-sm border border-neutral-200 hover:border-neutral-300 shadow-xs transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-neutral-100 text-[#FF9E15] border border-neutral-200 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>

                            {/* Icon Preview / Edit */}
                            <div className="relative group">
                              {item.icon_url ? (
                                <div className="w-10 h-10 rounded-sm bg-neutral-50 border border-neutral-200 flex items-center justify-center p-1 overflow-hidden">
                                  <Image
                                    src={item.icon_url}
                                    alt={item.title || "Icon"}
                                    width={30}
                                    height={30}
                                    className="object-contain"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemIcon(index)}
                                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-red-400 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <label className="w-10 h-10 rounded-sm border border-dashed border-neutral-300 hover:border-[#FF9E15] bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-neutral-700 cursor-pointer">
                                  {uploadingItemIndex === index ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-[#FF9E15]" />
                                  ) : (
                                    <Upload className="w-3.5 h-3.5 text-neutral-400" />
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleEditIconUpload(e, index)}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>

                            <h3 className="text-sm font-bold text-neutral-900 truncate max-w-xs sm:max-w-md">
                              {item.title || `Service #${index + 1}`}
                            </h3>
                          </div>

                          {/* Order and Delete Controls */}
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 rounded-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === formData.services.length - 1}
                              className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 rounded-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(index)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xs transition-colors ml-2 cursor-pointer"
                              title="Delete Service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                              Heading / Title
                            </label>
                            <input
                              type="text"
                              value={item.title || ""}
                              onChange={(e) => handleUpdateServiceItem(index, "title", e.target.value)}
                              placeholder="Service heading"
                              className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-sm text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#FF9E15] focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                              Description
                            </label>
                            <textarea
                              rows={1}
                              value={item.description || ""}
                              onChange={(e) => handleUpdateServiceItem(index, "description", e.target.value)}
                              placeholder="Service description"
                              className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-sm text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#FF9E15] focus:bg-white resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2 pb-6">
                {hasDraft && (
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    <RotateCcw className="w-4 h-4 text-neutral-500" />
                    Discard Changes
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm text-sm font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-md transition-all disabled:opacity-60 cursor-pointer active:scale-98"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Services Section...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Services Section
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
