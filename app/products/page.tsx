import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import ProductsView from "@/components/ProductsView";

export const revalidate = 60;

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: "Products | Linda Home Decor",
  description:
    "Explore Linda Home Decor's handcrafted furniture and home decor collections.",
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const categoryParam = typeof resolvedParams.category === "string" ? resolvedParams.category : undefined;

  const [categoriesRes, productsRes] = await Promise.allSettled([
    getCategories(),
    getProducts(),
  ]);

  const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value : [];
  const products = productsRes.status === "fulfilled" ? productsRes.value : [];

  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-white pt-24 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FF9E15] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsView
        initialCategories={categories}
        initialProducts={products}
        initialCategorySlug={categoryParam}
      />
    </Suspense>
  );
}
