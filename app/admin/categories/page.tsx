"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useStore, CategoryItem } from "@/context/StoreContext";
import {
  Loader2,
  Upload,
  Save,
  Trash2,
  Plus,
  Edit2,
  X,
  ImageIcon,
  Tag,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

interface CategoryFormData {
  id?: string;
  name: string;
  slug: string;
  image_url: string;
  display_order: number;
}

const emptyCategoryForm: CategoryFormData = {
  name: "",
  slug: "",
  image_url: "",
  display_order: 0,
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    categories,
    categoriesLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useStore();

  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>(emptyCategoryForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login");
    }
  }, [user, authLoading, router]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      ...emptyCategoryForm,
      display_order: categories.length,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: CategoryItem) => {
    setIsEditing(true);
    setFormData({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url || "",
      display_order: cat.display_order ?? 0,
    });
    setIsModalOpen(true);
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

  // Handle Name Input & auto-slug
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : slug,
    }));
  };

  // Upload Image
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

      setFormData((prev) => ({ ...prev, image_url: json.url }));
      setStatusMessage({ type: "success", text: "Category image uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploading(false);
    }
  };

  // Remove Image
  const handleRemoveImage = async () => {
    if (!formData.image_url) return;
    const url = formData.image_url;
    setFormData((prev) => ({ ...prev, image_url: "" }));
    await deleteFromCloudinary(url);
    setStatusMessage({ type: "success", text: "Category image removed successfully!" });
  };

  // Submit Category Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMessage({ type: "error", text: "Category name is required." });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      if (isEditing && formData.id) {
        await updateCategory(formData.id, {
          name: formData.name,
          slug: formData.slug,
          image_url: formData.image_url,
          display_order: formData.display_order,
        });
        setStatusMessage({ type: "success", text: "Category updated successfully!" });
      } else {
        await createCategory({
          name: formData.name,
          slug: formData.slug,
          image_url: formData.image_url,
          display_order: formData.display_order,
        });
        setStatusMessage({ type: "success", text: "Category created successfully!" });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Delete Category
  const handleDelete = async (cat: CategoryItem) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }

    setDeletingId(cat.id);
    setStatusMessage(null);

    try {
      if (cat.image_url) {
        await deleteFromCloudinary(cat.image_url);
      }
      await deleteCategory(cat.id);
      setStatusMessage({ type: "success", text: "Category deleted successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
          <p className="text-sm font-medium text-neutral-500">Loading Categories...</p>
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
        <AdminHeader title="Categories Management" />

        {/* Reusable Top Center Toast */}
        <AdminToast
          message={statusMessage}
          onClose={() => setStatusMessage(null)}
          duration={3500}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-6xl w-full mx-auto space-y-6">
            {/* Header / Summary Card */}
            <div className="bg-white rounded-sm border border-neutral-200 p-5 sm:p-6 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-black flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#FF9E15]" />
                  Product Categories ({categories.length})
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                  Manage categories shown in the Product Category section and store navigation
                </p>
              </div>

              <button
                onClick={handleOpenCreate}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {/* Categories Grid / Cards List */}
            {categories.length === 0 ? (
              <div className="bg-white rounded-sm border border-dashed border-neutral-300 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-[#FF9E15] flex items-center justify-center mx-auto">
                  <Tag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-black">No Categories Found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto font-medium">
                  Create your first product category with a name and image to display on the storefront.
                </p>
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create Category
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-sm border border-neutral-200 overflow-hidden shadow-xs flex flex-col group hover:border-neutral-300 transition-all"
                  >
                    {/* Category Image */}
                    <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                      {cat.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1">
                          <ImageIcon className="w-6 h-6 text-neutral-300" />
                          <span className="text-[10px] font-medium">No Image</span>
                        </div>
                      )}

                      {/* Top Action Overlay */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 bg-white/90 hover:bg-white text-black rounded-sm shadow-xs transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={deletingId === cat.id}
                          className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Category"
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="text-sm font-bold text-black truncate" title={cat.name}>
                          {cat.name}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-end text-[11px] text-neutral-500 font-medium">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="text-[#FF9E15] font-semibold hover:underline cursor-pointer"
                        >
                          Edit Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-sm border border-neutral-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FF9E15]" />
                {isEditing ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter Category"
                  className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                />
              </div>

              {/* Image Upload Option */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">
                  Category Image
                </label>

                {/* Direct Image URL input */}
                <div>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  />
                </div>

                {/* File Upload Button (Disabled when image exists) */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || Boolean(formData.image_url)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border-2 border-dashed border-neutral-300 hover:border-[#FF9E15] hover:bg-amber-50/30 text-xs font-bold text-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-transparent"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF9E15]" />
                        Uploading Image...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#FF9E15]" />
                        Upload Category Image
                      </>
                    )}
                  </button>
                </div>

                {/* Image Preview with Remove Button */}
                {formData.image_url ? (
                  <div className="relative h-44 rounded-sm overflow-hidden border border-neutral-300 bg-neutral-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image_url}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white px-2 py-1 rounded-sm shadow-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                      title="Delete image from Cloudinary"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="h-28 rounded-sm border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center text-neutral-400 gap-1">
                    <ImageIcon className="w-5 h-5 text-neutral-300" />
                    <span className="text-[11px] font-medium">No image uploaded</span>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-sm border border-neutral-300 text-xs font-semibold text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      {isEditing ? "Update Category" : "Create Category"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
