import { Database } from "./supabase.types";
export type Characters = Database["public"]["Tables"]["characters"]['Row']
