import { createClient } from "@supabase/supabase-js";

function normalisasiUrl(url) {
  if (!url) return "";
  let clean = url.trim();
  clean = clean.replace(/\/+$/, "");
  clean = clean.replace(/\/rest\/v1\/?$/i, "");
  return clean.replace(/\/+$/, "");
}

/**
 * Membuat klien Supabase untuk server dengan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca katalog dan detail produk di sisi server.
 */
export function buatKlienServer() {
  const supabaseUrl = normalisasiUrl(process.env.SUPABASE_URL);
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY wajib disetel di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createServerClient = buatKlienServer;
export default buatKlienServer;

