import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function normalisasiUrl(url) {
  if (!url) return "";
  let clean = url.trim();
  clean = clean.replace(/\/+$/, "");
  clean = clean.replace(/\/rest\/v1\/?$/i, "");
  return clean.replace(/\/+$/, "");
}

/**
 * Proxy / Middleware (Next.js 16) untuk memproteksi rute /admin.
 * Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth.
 * Jika belum login, pengunjung dialihkan ke /admin/login.
 */
export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = normalisasiUrl(process.env.SUPABASE_URL);
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Ambil user dari Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/";

  // Semua rute di bawah /admin (kecuali /admin/login) wajib login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};

