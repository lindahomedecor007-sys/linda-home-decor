import { supabase } from "@/lib/supabase/client";

export interface StatisticItem {
  id: string;
  value: string; // e.g. "250", "150+", "100", "15"
  label: string; // e.g. "Projects", "Residential houses", "Interior design projects", "Years of experience"
  display_order?: number;
}

export interface StatisticsSectionData {
  id?: string;
  title?: string;
  items: StatisticItem[];
  created_at?: string;
  updated_at?: string;
}

export const defaultStatisticsData: StatisticsSectionData = {
  title: "Our Achievements.",
  items: [],
};

export async function getStatisticsSection(): Promise<StatisticsSectionData | null> {
  try {
    const { data, error } = await supabase
      .from("statistics_section")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    let parsedItems: StatisticItem[] = [];
    if (Array.isArray(data.items)) {
      parsedItems = data.items;
    } else if (typeof data.items === "string") {
      try {
        parsedItems = JSON.parse(data.items);
      } catch {
        parsedItems = [];
      }
    }

    return {
      id: data.id,
      title: data.title !== undefined && data.title !== null ? data.title : "Our Achievements.",
      items: parsedItems,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.error("Error fetching statistics section:", err);
    return null;
  }
}

export async function saveStatisticsSection(
  statsData: StatisticsSectionData
): Promise<{ data: StatisticsSectionData | null; error: Error | null }> {
  try {
    const payload = {
      title: statsData.title || "",
      items: statsData.items || [],
      updated_at: new Date().toISOString(),
    };

    if (statsData.id) {
      const { data, error } = await supabase
        .from("statistics_section")
        .update(payload)
        .eq("id", statsData.id)
        .select()
        .single();

      if (error) throw new Error(error.message || "Failed to update statistics section");

      let parsedItems: StatisticItem[] = [];
      if (Array.isArray(data.items)) parsedItems = data.items;
      else if (typeof data.items === "string") parsedItems = JSON.parse(data.items);

      return {
        data: {
          id: data.id,
          title: data.title || "",
          items: parsedItems,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        error: null,
      };
    } else {
      // Check if row already exists
      const { data: existing } = await supabase
        .from("statistics_section")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from("statistics_section")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to update statistics section");

        let parsedItems: StatisticItem[] = [];
        if (Array.isArray(data.items)) parsedItems = data.items;
        else if (typeof data.items === "string") parsedItems = JSON.parse(data.items);

        return {
          data: {
            id: data.id,
            title: data.title || "",
            items: parsedItems,
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
          error: null,
        };
      } else {
        const { data, error } = await supabase
          .from("statistics_section")
          .insert([payload])
          .select()
          .single();

        if (error) throw new Error(error.message || "Failed to insert statistics section");

        let parsedItems: StatisticItem[] = [];
        if (Array.isArray(data.items)) parsedItems = data.items;
        else if (typeof data.items === "string") parsedItems = JSON.parse(data.items);

        return {
          data: {
            id: data.id,
            title: data.title || "",
            items: parsedItems,
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
          error: null,
        };
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save statistics section";
    console.error("Error saving statistics section:", err);
    return { data: null, error: new Error(errorMsg) };
  }
}
