export * from "./types";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase.types";
const supabaseUrl = "https://wbrgrjkwkqegyndtmddh.supabase.co";
const supabaseKey = "rbnQvJGhkLxV*waKz*CoCbmMVfDWiv3.y3Z";
const supabase = createClient<Database>(supabaseUrl, supabaseKey);
const getCharacters = async () => {
  let { data: characters, error } = await supabase.from("characters").select("*");
  return characters;
};
