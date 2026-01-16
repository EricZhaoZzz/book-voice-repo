import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from("textbooks").select("count");

    if (error) {
      console.error("Connection test failed:", error.message);
      process.exit(1);
    }

    console.log("Database connection successful!");
    console.log("Query result:", data);
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

testConnection();
