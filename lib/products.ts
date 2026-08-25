import { supabase } from "@/lib/supabase/client";
import { ProductItem } from "@/context/StoreContext";

export interface GetProductsOptions {
  limit?: number;
}

export async function getProducts(options?: GetProductsOptions): Promise<ProductItem[]> {
  try {
    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.limit && options.limit > 0) {
      query = query.limit(options.limit);
    }

    const { data: prods, error } = await query;

    if (error || !prods) {
      return [];
    }

    return prods.map((p: Record<string, unknown>) => {
      let specs: string[] = [];
      if (Array.isArray(p.specifications)) {
        specs = p.specifications.map((s) => String(s));
      } else if (typeof p.specifications === "string") {
        try {
          specs = JSON.parse(p.specifications);
        } catch {
          specs = [];
        }
      }

      let subImgs: string[] = [];
      if (Array.isArray(p.sub_images)) {
        subImgs = p.sub_images.map((s) => String(s));
      } else if (typeof p.sub_images === "string") {
        try {
          subImgs = JSON.parse(p.sub_images);
        } catch {
          subImgs = [];
        }
      }

      return {
        id: String(p.id || ""),
        name: String(p.name || p.title || p.product_name || `Product ${p.id}`),
        slug: String(p.slug || p.id || p.name).toLowerCase().replace(/\s+/g, "-"),
        category_id: p.category_id ? String(p.category_id) : undefined,
        category_name: p.category_name ? String(p.category_name) : undefined,
        category: p.category_name ? String(p.category_name) : undefined,
        description: p.description ? String(p.description) : undefined,
        specifications: specs,
        image_url: p.image_url ? String(p.image_url) : undefined,
        sub_images: subImgs,
        display_order: typeof p.display_order === "number" ? p.display_order : 0,
        created_at: p.created_at ? String(p.created_at) : undefined,
        updated_at: p.updated_at ? String(p.updated_at) : undefined,
      };
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}
