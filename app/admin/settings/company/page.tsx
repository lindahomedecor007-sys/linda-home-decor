"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  MessageCircle,
  RotateCcw,
  Share2,
} from "lucide-react";
import { InstagramIcon, FacebookIcon, YoutubeIcon } from "@/components/SocialIcons";
import {
  CompanySettingsData,
  defaultCompanySettings,
} from "@/lib/companySettings";
import { useStore } from "@/context/StoreContext";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

const DRAFT_STORAGE_KEY = "linda_company_settings_draft";

export default function AdminCompanySettingsPage() {
  const { companySettings, companySettingsLoading, saveCompanySettings } = useStore();

  const [formData, setFormData] = useState<CompanySettingsData>(() => companySettings || defaultCompanySettings);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Sync state from context & restore any unsaved local draft once
  useEffect(() => {
    if (companySettingsLoading) return;

    let restoredFromDraft = false;
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          if (parsedDraft && typeof parsedDraft === "object") {
            setFormData({
              ...(companySettings || defaultCompanySettings),
              ...parsedDraft,
              id: companySettings?.id || parsedDraft.id,
            });
            setHasDraft(true);
            restoredFromDraft = true;
          }
        } catch {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      }
    }

    if (!restoredFromDraft && companySettings) {
      setFormData(companySettings);
    }
  }, [companySettings, companySettingsLoading]);

  // Save changes locally in real-time so data is never lost when switching tabs
  const handleChange = (field: keyof CompanySettingsData, value: string) => {
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
          // Ignore storage quota errors
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
    setFormData(companySettings || defaultCompanySettings);
    setStatusMessage({
      type: "info",
      text: "Unsaved draft discarded. Reset to saved database version.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const saved = await saveCompanySettings(formData);
      if (saved) {
        setFormData(saved);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setHasDraft(false);
      setStatusMessage({
        type: "success",
        text: "Company details updated successfully!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save company details";
      setStatusMessage({
        type: "error",
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Reusable Top Header */}
      <AdminHeader title="Company Details Settings" />

      {/* Reusable Top Center Toast */}
      <AdminToast
        message={statusMessage}
        onClose={() => setStatusMessage(null)}
        duration={3500}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {companySettingsLoading && !companySettings ? (
            <div className="max-w-5xl w-full mx-auto bg-white rounded-sm border border-neutral-200 p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15] mx-auto" />
              <p className="text-sm font-medium text-neutral-500">Loading Company Details...</p>
            </div>
          ) : (
            <div className="max-w-5xl w-full mx-auto space-y-6">
              {/* Draft Auto-Restore Notification */}
              {hasDraft && (
                <div className="p-3.5 sm:p-4 rounded-sm bg-amber-50/90 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF9E15] animate-pulse shrink-0" />
                    <span>
                      <strong>Unsaved draft restored:</strong> Your typed changes are saved locally so you won&apos;t lose work. Click <strong>Save Company Details</strong> to update the database.
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. General Company Profile */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                  <Building2 className="w-4 h-4 text-[#FF9E15]" />
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                    Company Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleChange("company_name", e.target.value)}
                      placeholder="Enter company name"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Tagline / Slogan */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      value={formData.tagline || ""}
                      onChange={(e) => handleChange("tagline", e.target.value)}
                      placeholder="Enter company tagline"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Website URL */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Website URL
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        value={formData.website_url || ""}
                        onChange={(e) => handleChange("website_url", e.target.value)}
                        placeholder="https://example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Contact Information */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                  <Phone className="w-4 h-4 text-[#FF9E15]" />
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                    Contact Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Primary Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="contact@company.com"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Primary Mobile / Phone */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Primary Mobile / Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+91 1234567890"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Alternate Phone */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Alternate Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={formData.alternate_phone || ""}
                        onChange={(e) => handleChange("alternate_phone", e.target.value)}
                        placeholder="+91 1234567890"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      WhatsApp Number
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={formData.whatsapp_number || ""}
                        onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                        placeholder="+91 1234567890"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Physical Address & Location */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                  <MapPin className="w-4 h-4 text-[#FF9E15]" />
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                    Address & Location
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Street / Office Address
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Enter street or building address"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="City"
                        className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* State / Province */}
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={formData.state || ""}
                        onChange={(e) => handleChange("state", e.target.value)}
                        placeholder="State"
                        className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Postal / ZIP Code */}
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                        Postal / ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.postal_code || ""}
                        onChange={(e) => handleChange("postal_code", e.target.value)}
                        placeholder="ZIP code"
                        className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country || ""}
                        onChange={(e) => handleChange("country", e.target.value)}
                        placeholder="Country"
                        className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Google Maps Link */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Google Maps Link / URL
                    </label>
                    <input
                      type="url"
                      value={formData.google_maps_link || ""}
                      onChange={(e) => handleChange("google_maps_link", e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Social Media Links */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                  <Share2 className="w-4 h-4 text-[#FF9E15]" />
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                    Social Media Profiles
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Instagram */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Instagram Profile URL
                    </label>
                    <div className="relative">
                      <InstagramIcon className="w-4 h-4 text-[#E4405F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        value={formData.instagram_url || ""}
                        onChange={(e) => handleChange("instagram_url", e.target.value)}
                        placeholder="https://instagram.com/username"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Facebook Page URL
                    </label>
                    <div className="relative">
                      <FacebookIcon className="w-4 h-4 text-[#1877F2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        value={formData.facebook_url || ""}
                        onChange={(e) => handleChange("facebook_url", e.target.value)}
                        placeholder="https://facebook.com/page"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* YouTube */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      YouTube Channel URL
                    </label>
                    <div className="relative">
                      <YoutubeIcon className="w-4 h-4 text-[#FF0000] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        value={formData.youtube_url || ""}
                        onChange={(e) => handleChange("youtube_url", e.target.value)}
                        placeholder="https://youtube.com/@channel"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Business Hours */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                  <Clock className="w-4 h-4 text-[#FF9E15]" />
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                    Business Hours & Schedule
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    value={formData.opening_hours || ""}
                    onChange={(e) => handleChange("opening_hours", e.target.value)}
                    placeholder="e.g. Mon - Sat: 9:00 AM - 8:00 PM, Sunday: Closed"
                    className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  />
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
                      Saving Company Details...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Company Details
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
