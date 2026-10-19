import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function normalisasiUrl(url) {
  if (!url) return "";
  let clean = url.trim();
  clean = clean.replace(/\/+$/, "");
  clean = clean.replace(/\/rest\/v1\/?$/i, "");
  return clean.replace(/\/+$/, "");
}

/**
 * Membuat klien Supabase untuk sesi admin menggunakan @supabase/ssr dan cookie.
 * Menggunakan SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY.
 * Dipakai untuk: login, keluar, ganti password, dan aksi kelola produk.
 */
export async function buatKlienSesiAdmin() {
  const cookieStore = await cookies();
  const supabaseUrl = normalisasiUrl(process.env.SUPABASE_URL);
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY wajib disetel di environment variable."
    );
  }

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Abaikan jika dipanggil saat Server Component sedang me-render
        }
      },
    },
  });
}

export const createAdminClient = buatKlienSesiAdmin;
export default buatKlienSesiAdmin;

