import { supabase } from "@/lib/supabase/client";
import { CategoryItem, CatalogItem } from "@/context/StoreContext";

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

    return cats.map((c: Record<string, unknown>) => {
      let catalogsList: CatalogItem[] = [];

      if (Array.isArray(c.catalogs)) {
        catalogsList = c.catalogs as CatalogItem[];
      } else if (typeof c.catalogs === "string" && c.catalogs.trim()) {
        try {
          catalogsList = JSON.parse(c.catalogs);
        } catch {
          catalogsList = [];
        }
      } else if (typeof c.catalog_url === "string" && c.catalog_url.trim()) {
        const raw = c.catalog_url.trim();
        if (raw.startsWith("[") || raw.startsWith("{")) {
          try {
            const parsed = JSON.parse(raw);
            catalogsList = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            catalogsList = [{ name: `${String(c.name || "Category")} Catalogue`, url: raw }];
          }
        } else {
          catalogsList = [{ name: `${String(c.name || "Category")} Catalogue`, url: raw }];
        }
      }

      const primaryCatalogUrl = catalogsList.length > 0
        ? catalogsList[0].url
        : (typeof c.catalog_url === "string" && !c.catalog_url.startsWith("[") ? c.catalog_url : undefined);

      return {
        id: String(c.id || ""),
        name: String(c.name || c.title || c.category_name || `Category ${c.id}`),
        slug: String(c.slug || c.name || c.id).toLowerCase().replace(/\s+/g, "-"),
        image_url: c.image_url ? String(c.image_url) : undefined,
        catalog_url: primaryCatalogUrl,
        catalogs: catalogsList,
        display_order: typeof c.display_order === "number" ? c.display_order : 0,
        created_at: c.created_at ? String(c.created_at) : undefined,
        updated_at: c.updated_at ? String(c.updated_at) : undefined,
      };
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}
