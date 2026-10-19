"use server";

import { redirect } from "next/navigation";
import { buatKlienSesiAdmin } from "@/lib/supabase/auth";

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : (prevState instanceof FormData ? prevState : null);
  if (!data) {
    return { error: "Data form tidak valid." };
  }

  const email = data.get("email")?.toString().trim();
  const password = data.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatKlienSesiAdmin();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (
      error.code === "invalid_credentials" ||
      error.message === "Invalid login credentials"
    ) {
      return { error: "Email atau password salah." };
    }
    return { error: error.message || "Gagal masuk. Periksa kembali email dan password." };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatKlienSesiAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

