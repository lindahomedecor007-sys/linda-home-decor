"use client";

import { useState, useRef } from "react";
import { useStore, ProductItem } from "@/context/StoreContext";
import {
  Package,
  Plus,
  Loader2,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  Save,
  ImageIcon,
  Tag,
  Layers,
  FileText,
  ListPlus,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminToast, { ToastMessage } from "@/components/AdminToast";

interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  category_id: string;
  category_name: string;
  description: string;
  specifications: string[];
  image_url: string;
  sub_images: string[];
}

const emptyProductForm: ProductFormData = {
  name: "",
  slug: "",
  category_id: "",
  category_name: "",
  description: "",
  specifications: [],
  image_url: "",
  sub_images: [],
};

export default function AdminProductsPage() {
  const {
    products,
    productsLoading,
    categories,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState<ToastMessage | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(emptyProductForm);
  const [specInput, setSpecInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingSub, setUploadingSub] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const subFileInputRef = useRef<HTMLInputElement>(null);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData(emptyProductForm);
    setSpecInput("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (prod: ProductItem) => {
    setIsEditing(true);
    setFormData({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      category_id: prod.category_id || "",
      category_name: prod.category_name || prod.category || "",
      description: prod.description || "",
      specifications: prod.specifications || [],
      image_url: prod.image_url || "",
      sub_images: prod.sub_images || [],
    });
    setSpecInput("");
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

  // Handle Category Selection in Form
  const handleCategoryChange = (catId: string) => {
    const selectedCat = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      category_id: catId,
      category_name: selectedCat ? selectedCat.name : "",
    }));
  };

  // Main Image Upload
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMain(true);
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
      setStatusMessage({ type: "success", text: "Main product image uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingMain(false);
    }
  };

  // Remove Main Image
  const handleRemoveMainImage = async () => {
    if (!formData.image_url) return;
    const url = formData.image_url;
    setFormData((prev) => ({ ...prev, image_url: "" }));
    await deleteFromCloudinary(url);
    setStatusMessage({ type: "success", text: "Main image removed successfully!" });
  };

  // Sub Images Upload
  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingSub(true);
    setStatusMessage(null);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const data = new FormData();
        data.append("file", files[i]);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

        const json = await res.json();
        if (res.ok && json.url) {
          uploadedUrls.push(json.url);
        }
      }

      setFormData((prev) => ({
        ...prev,
        sub_images: [...prev.sub_images, ...uploadedUrls],
      }));
      setStatusMessage({
        type: "success",
        text: `${uploadedUrls.length} sub image(s) uploaded successfully!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload sub images";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingSub(false);
    }
  };

  // Remove single Sub Image
  const handleRemoveSubImage = async (index: number) => {
    const urlToRemove = formData.sub_images[index];
    setFormData((prev) => ({
      ...prev,
      sub_images: prev.sub_images.filter((_, i) => i !== index),
    }));
    if (urlToRemove) {
      await deleteFromCloudinary(urlToRemove);
    }
    setStatusMessage({ type: "success", text: "Sub image removed successfully!" });
  };

  // Add Spec value
  const handleAddSpec = () => {
    const trimmed = specInput.trim();
    if (!trimmed) return;
    if (formData.specifications.includes(trimmed)) {
      setSpecInput("");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, trimmed],
    }));
    setSpecInput("");
  };

  // Remove Spec value
  const handleRemoveSpec = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  // Submit Product Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMessage({ type: "error", text: "Product name is required." });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      if (isEditing && formData.id) {
        await updateProduct(formData.id, {
          name: formData.name,
          category_id: formData.category_id || undefined,
          category_name: formData.category_name || undefined,
          description: formData.description,
          specifications: formData.specifications,
          image_url: formData.image_url,
          sub_images: formData.sub_images,
        });
        setStatusMessage({ type: "success", text: "Product updated successfully!" });
      } else {
        await createProduct({
          name: formData.name,
          category_id: formData.category_id || undefined,
          category_name: formData.category_name || undefined,
          description: formData.description,
          specifications: formData.specifications,
          image_url: formData.image_url,
          sub_images: formData.sub_images,
        });
        setStatusMessage({ type: "success", text: "Product created successfully!" });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save product";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Delete Product Trigger
  const handleDelete = (prod: ProductItem) => {
    setProductToDelete(prod);
  };

  // Confirm Delete Product
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setDeletingId(productToDelete.id);
    setStatusMessage(null);

    try {
      if (productToDelete.image_url) {
        await deleteFromCloudinary(productToDelete.image_url);
      }
      if (productToDelete.sub_images && productToDelete.sub_images.length > 0) {
        for (const sub of productToDelete.sub_images) {
          await deleteFromCloudinary(sub);
        }
      }
      await deleteProduct(productToDelete.id);
      setStatusMessage({ type: "success", text: "Product deleted successfully!" });
      setProductToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category_name && p.category_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === "all" ||
      p.category_id === selectedCategoryFilter ||
      p.category_name?.toLowerCase() === selectedCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Reusable Top Header */}
      <AdminHeader title="Products Management" />

      {/* Reusable Top Center Toast */}
      <AdminToast
        message={statusMessage}
        onClose={() => setStatusMessage(null)}
        duration={3500}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-6xl w-full mx-auto space-y-6">
            {/* Header & Filter Controls Bar */}
            <div className="bg-white rounded-sm border border-neutral-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                />
              </div>

              {/* Action Buttons & Category Filter */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9E15] cursor-pointer"
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading && products.length === 0 ? (
              <div className="bg-white rounded-sm border border-neutral-200 p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15] mx-auto" />
                <p className="text-sm font-medium text-neutral-500">Loading Products Catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-sm border border-dashed border-neutral-300 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-[#FF9E15] flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-black">No Products Found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto font-medium">
                  {products.length === 0
                    ? "Add your first product with category, images, description, and specifications."
                    : "No products matched your search or category filter criteria."}
                </p>
                {products.length === 0 && (
                  <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create Product
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-sm border border-neutral-200 overflow-hidden shadow-xs flex flex-col group hover:border-neutral-300 transition-all"
                  >
                    {/* Product Main Image */}
                    <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                      {prod.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 bg-neutral-50">
                          <ImageIcon className="w-6 h-6 text-neutral-300" />
                          <span className="text-[10px] font-medium">No Image</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      {prod.category_name && (
                        <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm">
                          {prod.category_name}
                        </div>
                      )}

                      {/* Action Overlay */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 bg-white/90 hover:bg-white text-black rounded-sm shadow-xs transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod)}
                          disabled={deletingId === prod.id}
                          className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Product"
                        >
                          {deletingId === prod.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                      <div>
                        <h4 className="text-sm font-bold text-black truncate" title={prod.name}>
                          {prod.name}
                        </h4>
                        {prod.description && (
                          <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                            {prod.description}
                          </p>
                        )}
                      </div>

                      {/* Badges: Specs count & Sub images count */}
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                        <div className="flex items-center gap-2">
                          <span className="bg-neutral-100 px-1.5 py-0.5 rounded-sm text-[10px] font-medium">
                            {prod.specifications?.length || 0} Specs
                          </span>
                          <span className="bg-neutral-100 px-1.5 py-0.5 rounded-sm text-[10px] font-medium">
                            {prod.sub_images?.length || 0} Photos
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="text-[#FF9E15] font-semibold hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      {/* Create / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-sm border border-neutral-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Package className="w-4 h-4 text-[#FF9E15]" />
                {isEditing ? "Edit Product" : "Create New Product"}
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
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#FF9E15]" />
                  Select Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">-- Choose Category (Optional) --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-neutral-300 bg-neutral-50/50 text-black font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#FF9E15]" />
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product overview and details..."
                  className="w-full px-3.5 py-2 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Specifications (Value Only with Add Option) */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="block text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1">
                  <ListPlus className="w-3.5 h-3.5 text-[#FF9E15]" />
                  Specifications (Values)
                </label>

                {/* Add Spec Value Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={specInput}
                    onChange={(e) => setSpecInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSpec();
                      }
                    }}
                    placeholder="Enter specification"
                    className="flex-1 px-3 py-2 text-xs rounded-sm border border-neutral-300 bg-neutral-50/50 text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] rounded-sm transition-colors cursor-pointer"
                  >
                    Add Spec
                  </button>
                </div>

                {/* Spec Values Pill List */}
                {formData.specifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 rounded-sm border border-neutral-200">
                    {formData.specifications.map((spec, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-white border border-neutral-300 text-xs font-medium text-neutral-800 shadow-2xs"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(i)}
                          className="text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Image Upload Option */}
              <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                <label className="block text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-[#FF9E15]" />
                  Main Product Image
                </label>

                {/* Upload Button (Disabled when main image exists) */}
                <div>
                  <input
                    ref={mainFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => mainFileInputRef.current?.click()}
                    disabled={uploadingMain || Boolean(formData.image_url)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border-2 border-dashed border-neutral-300 hover:border-[#FF9E15] hover:bg-amber-50/30 text-xs font-bold text-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-transparent"
                  >
                    {uploadingMain ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF9E15]" />
                        Uploading Main Image...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#FF9E15]" />
                        Upload Main Product Image
                      </>
                    )}
                  </button>
                </div>

                {/* Main Image Preview */}
                {formData.image_url && (
                  <div className="relative h-40 rounded-sm overflow-hidden border border-neutral-300 bg-neutral-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image_url}
                      alt="Main Product Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveMainImage}
                      className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white px-2 py-1 rounded-sm shadow-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                      title="Delete main image from Cloudinary"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Sub Images Upload Option */}
              <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                <label className="block text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#FF9E15]" />
                  Sub Images / Gallery ({formData.sub_images.length})
                </label>

                {/* Upload Sub Images Button */}
                <div>
                  <input
                    ref={subFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSubImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => subFileInputRef.current?.click()}
                    disabled={uploadingSub}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border-2 border-dashed border-neutral-300 hover:border-[#FF9E15] hover:bg-amber-50/30 text-xs font-bold text-black transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploadingSub ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF9E15]" />
                        Uploading Sub Images...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#FF9E15]" />
                        Upload Sub Images
                      </>
                    )}
                  </button>
                </div>

                {/* Sub Images Grid */}
                {formData.sub_images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {formData.sub_images.map((subUrl, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-sm overflow-hidden border border-neutral-300 bg-neutral-100 group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={subUrl}
                          alt={`Sub image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSubImage(idx)}
                          className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-600 text-white p-1 rounded-sm shadow-xs transition-all cursor-pointer"
                          title="Delete sub image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
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
                      Saving Product...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      {isEditing ? "Update Product" : "Create Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-sm border border-neutral-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-black">Delete Product</h3>
              </div>
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={Boolean(deletingId)}
                className="text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-black">&quot;{productToDelete.name}&quot;</span>? All specifications and gallery photos will be removed.
            </p>

            {/* Product Preview Card */}
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-sm border border-neutral-200">
              <div className="relative w-12 h-12 rounded-sm overflow-hidden bg-neutral-200 shrink-0">
                {productToDelete.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={productToDelete.image_url}
                    alt={productToDelete.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Package className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-black truncate">{productToDelete.name}</h4>
                <p className="text-[11px] text-neutral-500 font-medium truncate mt-0.5">
                  Category: {productToDelete.category_name || productToDelete.category || "Uncategorized"}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-sm border border-neutral-300 text-xs font-semibold text-black hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={Boolean(deletingId)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
