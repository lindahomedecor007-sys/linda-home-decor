import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageIcon, Check } from "lucide-react";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import RelatedProductsSection from "@/components/RelatedProductsSection";
import ProductEnquiryForm from "@/components/ProductEnquiryForm";
import ProductImageGallery from "@/components/ProductImageGallery";

export const revalidate = 60;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();
  const lowerSlug = slug.toLowerCase();
  const product = products.find(
    (p) => p.slug.toLowerCase() === lowerSlug || p.id.toLowerCase() === lowerSlug
  );

  if (!product) {
    return {
      title: "Product Not Found | Linda Home Decor",
    };
  }

  return {
    title: `${product.name} | Linda Home Decor`,
    description:
      product.description ||
      `Discover ${product.name} at Linda Home Decor. Handcrafted luxury interior furniture.`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const lowerSlug = slug.toLowerCase();

  const [productsRes, categoriesRes] = await Promise.allSettled([
    getProducts(),
    getCategories(),
  ]);

  const products = productsRes.status === "fulfilled" ? productsRes.value : [];
  const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value : [];

  const product = products.find(
    (p) => p.slug.toLowerCase() === lowerSlug || p.id.toLowerCase() === lowerSlug
  );

  if (!product) {
    notFound();
  }

  // Related products from same category
  const relatedProducts = products
    .filter(
      (p) =>
        p.id !== product.id &&
        ((product.category_id && p.category_id === product.category_id) ||
          (product.category_name &&
            p.category_name?.toLowerCase() === product.category_name?.toLowerCase()))
    )
    .slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900 pt-20">

      {/* Main Product Details Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Interactive Product Image Gallery */}
          <ProductImageGallery
            mainImage={product.image_url}
            subImages={product.sub_images}
            productName={product.name}
          />

          {/* Product Info & Specifications */}
          <div className="flex flex-col">
            {product.category_name && (
              <div className="mb-2">
                <Link
                  href={`/products?category=${encodeURIComponent(product.category_name)}`}
                  className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-neutral-100 text-[#FF9E15] rounded-xs hover:bg-[#FF9E15]/10 transition-colors"
                >
                  {product.category_name}
                </Link>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-neutral-900 tracking-tight">
              {product.name}
            </h1>

            {product.description && (
              <div className="mt-4 text-sm sm:text-base text-neutral-600 font-light leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            )}

            {/* Specifications Section */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mb-3">
                  Specifications & Details
                </h2>
                <ul className="space-y-2">
                  {product.specifications.map((spec, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-[#FF9E15] shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Enquiry & Actions */}
            <Suspense fallback={<div className="mt-8 pt-6 border-t border-neutral-200" />}>
              <ProductEnquiryForm product={product} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Related Products Section Component */}
      <RelatedProductsSection products={relatedProducts} />
    </div>
  );
}
