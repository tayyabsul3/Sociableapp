import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://plrhlsmmhmuutumibwez.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscmhsc21taG11dXR1bWlid2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwMzY3MzUsImV4cCI6MjA1MDYxMjczNX0.qxhaUvntW-xKEgyKTW48XCddPdgJdFfeuqBW9wFtmM0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
