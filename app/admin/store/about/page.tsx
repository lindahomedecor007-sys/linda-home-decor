"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import {
  Loader2,
  Upload,
  Save,
  Trash2,
  ImageIcon,
  RotateCcw,
  Sparkles,
  Target,
  Compass,
  FileText,
} from "lucide-react";
import { AboutSectionData, defaultAboutData } from "@/lib/about";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

const DRAFT_STORAGE_KEY = "linda_about_section_draft";

export default function AdminAboutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { aboutData, aboutLoading, saveAbout } = useStore();

  const [formData, setFormData] = useState<AboutSectionData>(defaultAboutData);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "vision" | "mission">("about");
  const [hasDraft, setHasDraft] = useState(false);
  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login");
    }
  }, [user, authLoading, router]);

  // Sync state from context & restore any unsaved draft
  useEffect(() => {
    if (aboutLoading) return;

    let restoredFromDraft = false;
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === "object") {
            setFormData({
              ...(aboutData || defaultAboutData),
              ...parsed,
              id: aboutData?.id || parsed.id,
            });
            setHasDraft(true);
            restoredFromDraft = true;
          }
        } catch {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      }
    }

    if (!restoredFromDraft && aboutData) {
      setFormData(aboutData);
    }
  }, [aboutData, aboutLoading]);

  // Real-time draft auto-save
  const handleChange = (field: keyof AboutSectionData, value: string) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
          setHasDraft(true);
        } catch {
          // Ignore storage quota
        }
      }
      return updated;
    });
  };

  const handleDiscardDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    setHasDraft(false);
    setFormData(aboutData || defaultAboutData);
    setStatusMessage({
      type: "info",
      text: "Unsaved draft discarded. Reset to database version.",
    });
  };

  // Cloudinary helper
  const deleteFromCloudinary = async (url?: string) => {
    if (!url || !url.includes("cloudinary.com")) return;
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  };

  // Handle image upload
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

      if (formData.about_image_url) {
        await deleteFromCloudinary(formData.about_image_url);
      }

      handleChange("about_image_url", json.url);
      setStatusMessage({ type: "success", text: "About image uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.about_image_url) return;
    const oldUrl = formData.about_image_url;
    handleChange("about_image_url", "");
    await deleteFromCloudinary(oldUrl);
    setStatusMessage({ type: "info", text: "Image removed" });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const saved = await saveAbout(formData);
      if (saved) {
        setFormData(saved);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setHasDraft(false);
      setStatusMessage({
        type: "success",
        text: "About section saved successfully!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save about section";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || aboutLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
          <p className="text-sm font-medium text-neutral-500">Loading About Section...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 md:h-screen md:overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen overflow-hidden">
        {/* Header */}
        <AdminHeader title="About Section Management" />

        {/* Toast */}
        <AdminToast
          message={statusMessage}
          onClose={() => setStatusMessage(null)}
          duration={3500}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-5xl w-full mx-auto space-y-6">
            {/* Draft Auto-Restore Notification */}
            {hasDraft && (
              <div className="p-3.5 sm:p-4 rounded-sm bg-amber-50/90 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF9E15] animate-pulse shrink-0" />
                  <span>
                    <strong>Unsaved draft restored:</strong> Your typed changes are saved locally. Click <strong>Save Changes</strong> to update the database.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                  Discard Draft
                </button>
              </div>
            )}

            {/* Sub-Section Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "about"
                    ? "bg-[#FF9E15] text-white shadow-xs"
                    : "bg-white text-neutral-600 hover:text-black border border-neutral-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                About Us
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("vision")}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "vision"
                    ? "bg-[#FF9E15] text-white shadow-xs"
                    : "bg-white text-neutral-600 hover:text-black border border-neutral-200"
                }`}
              >
                <Compass className="w-4 h-4" />
                Vision
                <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-amber-100 text-amber-800 font-medium normal-case">
                  Later
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mission")}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "mission"
                    ? "bg-[#FF9E15] text-white shadow-xs"
                    : "bg-white text-neutral-600 hover:text-black border border-neutral-200"
                }`}
              >
                <Target className="w-4 h-4" />
                Mission
                <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-amber-100 text-amber-800 font-medium normal-case">
                  Later
                </span>
              </button>
            </div>

            {/* TAB 1: About Us Section */}
            {activeTab === "about" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Main Image Upload */}
                <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                    <ImageIcon className="w-4 h-4 text-[#FF9E15]" />
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                      About Us Image (Left Side)
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {formData.about_image_url ? (
                      <div className="relative rounded-sm overflow-hidden border border-neutral-200 bg-neutral-50 max-w-md group">
                        <div className="relative aspect-4/3 w-full">
                          <Image
                            src={formData.about_image_url}
                            alt="About Section Image"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3 bg-white border-t border-neutral-100 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Change Image
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={uploading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-300 hover:border-[#FF9E15] rounded-sm p-8 text-center cursor-pointer transition-colors max-w-md bg-neutral-50 hover:bg-amber-50/30 group"
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-[#FF9E15]" />
                            <span className="text-xs text-neutral-600 font-medium">Uploading image...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-[#FF9E15]/10 text-neutral-500 group-hover:text-[#FF9E15] flex items-center justify-center transition-colors">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                              Click to upload about image
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              PNG, JPG, WebP up to 10MB
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Text Content (Subtitle, Heading, Paragraph) */}
                <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                    <Sparkles className="w-4 h-4 text-[#FF9E15]" />
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                      About Us Content (Right Side)
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Subtitle */}
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                        Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        value={formData.about_subtitle}
                        onChange={(e) => handleChange("about_subtitle", e.target.value)}
                        placeholder="e.g. About Linda Home Decor"
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
                        value={formData.about_heading}
                        onChange={(e) => handleChange("about_heading", e.target.value)}
                        placeholder="e.g. Crafting Timeless Living Spaces Since 2012"
                        className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Paragraph */}
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                        Description Paragraph
                      </label>
                      <textarea
                        rows={6}
                        value={formData.about_paragraph}
                        onChange={(e) => handleChange("about_paragraph", e.target.value)}
                        placeholder="Write your story, expertise, craftsmanship, and commitment to quality..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>
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
                        Saving About Section...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save About Section
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2 & 3: Vision and Mission Placeholder */}
            {activeTab === "vision" && (
              <div className="bg-white rounded-sm border border-neutral-200 p-8 sm:p-12 text-center shadow-xs space-y-3">
                <Compass className="w-12 h-12 text-neutral-300 mx-auto" />
                <h3 className="text-base font-bold text-neutral-800">Vision Section</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Vision section controls will be enabled here in the next step as requested.
                </p>
              </div>
            )}

            {activeTab === "mission" && (
              <div className="bg-white rounded-sm border border-neutral-200 p-8 sm:p-12 text-center shadow-xs space-y-3">
                <Target className="w-12 h-12 text-neutral-300 mx-auto" />
                <h3 className="text-base font-bold text-neutral-800">Mission Section</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Mission section controls will be enabled here in the next step as requested.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
