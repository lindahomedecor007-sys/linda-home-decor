import { supabase } from "@/lib/supabase/client";
import { CategoryItem } from "@/context/StoreContext";

export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const { data: cats, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !cats) {
      return [];
    }

    return cats.map((c: Record<string, unknown>) => ({
      id: String(c.id || ""),
      name: String(c.name || c.title || c.category_name || `Category ${c.id}`),
      slug: String(c.slug || c.name || c.id).toLowerCase().replace(/\s+/g, "-"),
      image_url: c.image_url ? String(c.image_url) : undefined,
      catalog_url: c.catalog_url ? String(c.catalog_url) : undefined,
      display_order: typeof c.display_order === "number" ? c.display_order : 0,
      created_at: c.created_at ? String(c.created_at) : undefined,
      updated_at: c.updated_at ? String(c.updated_at) : undefined,
    }));
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}
