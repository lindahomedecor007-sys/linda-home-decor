"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import {
  Loader2,
  Save,
  Trash2,
  Plus,
  Sparkles,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Hash,
  Type,
} from "lucide-react";
import { StatisticsSectionData, StatisticItem, defaultStatisticsData } from "@/lib/statistics";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

export default function AdminStatisticsManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { statisticsData, statisticsLoading, saveStatistics } = useStore();

  const [formData, setFormData] = useState<StatisticsSectionData>(defaultStatisticsData);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);

  // New item draft state
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login");
    }
  }, [user, authLoading, router]);

  // Sync with context
  useEffect(() => {
    if (statisticsData) {
      setFormData(statisticsData);
    }
  }, [statisticsData]);

  // Add new stat item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim() || !newLabel.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter both a count/value and a description label.",
      });
      return;
    }

    const newItem: StatisticItem = {
      id: `stat_${Date.now()}`,
      value: newValue.trim(),
      label: newLabel.trim(),
      display_order: formData.items.length,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setNewValue("");
    setNewLabel("");
    setStatusMessage({ type: "success", text: "Statistic added to list! Don't forget to save changes." });
  };

  // Update existing stat item
  const handleUpdateItem = (index: number, field: "value" | "label", val: string) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: val,
      };
      return { ...prev, items: newItems };
    });
  };

  // Remove stat item
  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    setStatusMessage({ type: "success", text: "Statistic removed." });
  };

  // Move item up/down
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.items.length) return;

    setFormData((prev) => {
      const newItems = [...prev.items];
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;
      return { ...prev, items: newItems };
    });
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const saved = await saveStatistics(formData);
      if (saved) {
        setFormData(saved);
      }
      setStatusMessage({ type: "success", text: "Statistics Section saved successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save statistics section";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || statisticsLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
          <p className="text-sm font-medium text-neutral-500">Loading Statistics Settings...</p>
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
        <AdminHeader title="Statistics Section Management" />

        {/* Reusable Top Center Toast */}
        <AdminToast
          message={statusMessage}
          onClose={() => setStatusMessage(null)}
          duration={3500}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-5xl w-full mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Header Card */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-black flex items-center gap-2">
                    Section Title & Header
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter Section Title"
                    className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                    This title is displayed with the horizontal accent lines on the frontend.
                  </p>
                </div>
              </div>

              {/* Add New Statistic Item Card */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-black flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#FF9E15]" />
                    Add New Statistic Item
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Value / Count Input */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1">
                        Count
                      </span>
                    </label>
                    <input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Enter Count"
                      className="w-full px-3.5 py-2 text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent"
                    />
                  </div>

                  {/* Label / Description Input */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1">
                        Heading
                      </span>
                    </label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Enter Heading"
                      className="w-full px-3.5 py-2 text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent"
                    />
                  </div>

                  {/* Add Button */}
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer h-[38px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Stat
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Statistics List Card */}
              <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-sm font-bold text-black flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#FF9E15]" />
                    Statistics Cards ({formData.items.length})
                  </h3>
                  <span className="text-xs text-neutral-500 font-medium">
                    {formData.items.length === 4
                      ? "Recommended 4 items"
                      : `${formData.items.length} items configured`}
                  </span>
                </div>

                {formData.items.length === 0 ? (
                  <div className="p-8 border border-dashed border-neutral-200 rounded-sm text-center text-neutral-400 space-y-1">
                    <BarChart3 className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="text-xs font-medium">No statistics added yet.</p>
                    <p className="text-[11px]">
                      Add counts and descriptions above to display in the achievements section on the frontend.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 bg-neutral-50/80 hover:bg-neutral-50 border border-neutral-200 rounded-sm transition-all"
                      >
                        <span className="text-xs font-mono text-neutral-400 w-6 text-center shrink-0">
                          {idx + 1}
                        </span>

                        {/* Value Input */}
                        <div className="w-full sm:w-40 shrink-0">
                          <label className="block sm:hidden text-[10px] uppercase font-bold text-neutral-500 mb-1">
                            Count / Value
                          </label>
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => handleUpdateItem(idx, "value", e.target.value)}
                            placeholder="Count / Value"
                            className="w-full px-3 py-1.5 text-sm font-bold rounded-sm border border-neutral-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent"
                          />
                        </div>

                        {/* Label Input */}
                        <div className="flex-1">
                          <label className="block sm:hidden text-[10px] uppercase font-bold text-neutral-500 mb-1">
                            Description Label
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleUpdateItem(idx, "label", e.target.value)}
                            placeholder="Description Label"
                            className="w-full px-3 py-1.5 text-sm rounded-sm border border-neutral-300 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent"
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200">
                          <button
                            type="button"
                            onClick={() => handleMove(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, "down")}
                            disabled={idx === formData.items.length - 1}
                            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer ml-1"
                            title="Delete statistic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                      Saving Statistics Section...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Statistics Section
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
