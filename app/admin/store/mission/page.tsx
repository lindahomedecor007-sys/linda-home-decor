"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

const DRAFT_STORAGE_KEY = "linda_mission_section_draft";

export default function AdminMissionPage() {
  const { aboutData, aboutLoading, saveAbout } = useStore();

  const [formData, setFormData] = useState(() => ({
    mission_image_url: aboutData?.mission_image_url || "",
    mission_heading: aboutData?.mission_heading || "",
    mission_paragraph: aboutData?.mission_paragraph || "",
  }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
              mission_image_url: parsed.mission_image_url || aboutData?.mission_image_url || "",
              mission_heading: parsed.mission_heading || aboutData?.mission_heading || "",
              mission_paragraph: parsed.mission_paragraph || aboutData?.mission_paragraph || "",
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
      setFormData({
        mission_image_url: aboutData.mission_image_url || "",
        mission_heading: aboutData.mission_heading || "",
        mission_paragraph: aboutData.mission_paragraph || "",
      });
    }
  }, [aboutData, aboutLoading]);

  // Real-time draft auto-save
  const handleChange = (field: "mission_image_url" | "mission_heading" | "mission_paragraph", value: string) => {
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
    setFormData({
      mission_image_url: aboutData?.mission_image_url || "",
      mission_heading: aboutData?.mission_heading || "",
      mission_paragraph: aboutData?.mission_paragraph || "",
    });
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

      if (formData.mission_image_url) {
        await deleteFromCloudinary(formData.mission_image_url);
      }

      handleChange("mission_image_url", json.url);
      setStatusMessage({ type: "success", text: "Mission image uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.mission_image_url) return;
    const oldUrl = formData.mission_image_url;
    handleChange("mission_image_url", "");
    await deleteFromCloudinary(oldUrl);
    setStatusMessage({ type: "info", text: "Image removed" });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const payload = {
        ...(aboutData || {
          about_image_url: "",
          about_subtitle: "",
          about_heading: "",
          about_paragraph: "",
        }),
        mission_heading: formData.mission_heading.trim(),
        mission_paragraph: formData.mission_paragraph.trim(),
        mission_image_url: formData.mission_image_url,
      };

      const saved = await saveAbout(payload);
      if (saved) {
        setFormData({
          mission_image_url: saved.mission_image_url || "",
          mission_heading: saved.mission_heading || "",
          mission_paragraph: saved.mission_paragraph || "",
        });
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setHasDraft(false);
      setStatusMessage({
        type: "success",
        text: "Mission section saved successfully!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save mission section";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Header */}
      <AdminHeader title="Mission Section Management" />

      {/* Toast */}
      <AdminToast
        message={statusMessage}
        onClose={() => setStatusMessage(null)}
        duration={3500}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {aboutLoading && !aboutData ? (
            <div className="max-w-5xl w-full mx-auto bg-white rounded-sm border border-neutral-200 p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15] mx-auto" />
              <p className="text-sm font-medium text-neutral-500">Loading Mission Section...</p>
            </div>
          ) : (
            <div className="max-w-5xl w-full mx-auto space-y-6">
              {/* Draft Auto-Restore Notification */}
              {hasDraft && (
              <div className="p-3.5 sm:p-4 rounded-sm bg-amber-50/90 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF9E15] animate-pulse shrink-0" />
                  <span>
                    <strong>Unsaved draft restored:</strong> Your typed changes are saved locally. Click <strong>Save Mission Section</strong> to update the database.
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

            {/* Mission Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Note */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-sm p-4 text-xs text-amber-900 flex items-center gap-3">
                <Target className="w-5 h-5 text-[#FF9E15] shrink-0" />
                <p>
                  <strong>Frontend Layout:</strong> The Mission section will display with the <strong>Content (Heading & Description) on the Left</strong> and the <strong>Image on the Right</strong>.
                </p>
              </div>

              {/* 1. Mission Image Upload */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                  <ImageIcon className="w-4 h-4 text-[#FF9E15]" />
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                    Mission Image (Right Side)
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

                  {formData.mission_image_url ? (
                    <div className="relative rounded-sm overflow-hidden border border-neutral-200 bg-neutral-50 max-w-md group">
                      <div className="relative aspect-4/3 w-full">
                        <Image
                          src={formData.mission_image_url}
                          alt="Mission Section Image"
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
                            Click to upload mission image
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

              {/* 2. Text Content (Heading, Paragraph) */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                  <Sparkles className="w-4 h-4 text-[#FF9E15]" />
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                    Mission Content (Left Side)
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Heading */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Mission Heading
                    </label>
                    <input
                      type="text"
                      value={formData.mission_heading}
                      onChange={(e) => handleChange("mission_heading", e.target.value)}
                      placeholder="e.g. Our Mission: Redefining Interior Excellence"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Paragraph */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Mission Description / Paragraph
                    </label>
                    <textarea
                      rows={6}
                      value={formData.mission_paragraph}
                      onChange={(e) => handleChange("mission_paragraph", e.target.value)}
                      placeholder="Detail your company's mission, values, everyday commitments, and customer promise..."
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
                      Saving Mission Section...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Mission Section
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
