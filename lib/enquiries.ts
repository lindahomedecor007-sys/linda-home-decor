import { supabase } from "@/lib/supabase/client";

export interface EnquiryItem {
  id: string;
  name: string;
  mobile_number: string;
  email?: string;
  note?: string;
  status: "pending" | "completed";
  created_at: string;
  updated_at?: string;
}

export type CreateEnquiryInput = {
  name: string;
  mobile_number: string;
  email?: string;
  note?: string;
};

export async function getEnquiries(): Promise<EnquiryItem[]> {
  try {
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching enquiries:", error);
      return [];
    }

    if (!data) return [];

    return data.map((item: Record<string, unknown>) => ({
      id: String(item.id || ""),
      name: String(item.name || ""),
      mobile_number: String(item.mobile_number || ""),
      email: item.email ? String(item.email) : undefined,
      note: item.note ? String(item.note) : undefined,
      status: (item.status === "completed" ? "completed" : "pending") as "pending" | "completed",
      created_at: String(item.created_at || new Date().toISOString()),
      updated_at: item.updated_at ? String(item.updated_at) : undefined,
    }));
  } catch (err) {
    console.error("Error in getEnquiries:", err);
    return [];
  }
}

export async function createEnquiry(
  input: CreateEnquiryInput
): Promise<{ data: EnquiryItem | null; error: Error | null }> {
  try {
    if (!input.name.trim() || !input.mobile_number.trim()) {
      return { data: null, error: new Error("Name and Mobile number are required") };
    }

    const payload = {
      name: input.name.trim(),
      mobile_number: input.mobile_number.trim(),
      email: input.email?.trim() || null,
      note: input.note?.trim() || null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("enquiries")
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Failed to submit enquiry");
    }

    const created: EnquiryItem = {
      id: String(data.id),
      name: String(data.name || ""),
      mobile_number: String(data.mobile_number || ""),
      email: data.email ? String(data.email) : undefined,
      note: data.note ? String(data.note) : undefined,
      status: (data.status === "completed" ? "completed" : "pending") as "pending" | "completed",
      created_at: String(data.created_at || new Date().toISOString()),
      updated_at: data.updated_at ? String(data.updated_at) : undefined,
    };

    return { data: created, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to submit enquiry";
    console.error("Error submitting enquiry:", err);
    return { data: null, error: new Error(errorMsg) };
  }
}

export async function updateEnquiryStatus(
  id: string,
  status: "pending" | "completed"
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from("enquiries")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message || "Failed to update status");
    return { error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update enquiry status";
    console.error("Error updating enquiry status:", err);
    return { error: new Error(errorMsg) };
  }
}

export async function deleteEnquiry(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from("enquiries").delete().eq("id", id);
    if (error) throw new Error(error.message || "Failed to delete enquiry");
    return { error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete enquiry";
    console.error("Error deleting enquiry:", err);
    return { error: new Error(errorMsg) };
  }
}
