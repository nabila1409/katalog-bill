"use server";

import { redirect } from "next/navigation";
import { buatKlienSesiAdmin, pastikanAdminSudahLogin } from "@/lib/supabase/auth";

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

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : (prevState instanceof FormData ? prevState : null);
  if (!data) {
    return { error: "Data form tidak valid." };
  }

  const passwordBaru = data.get("password_baru")?.toString() || "";
  const konfirmasiPassword = data.get("konfirmasi_password")?.toString() || "";

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  let supabase;
  try {
    const authResult = await pastikanAdminSudahLogin();
    supabase = authResult.supabase;
  } catch (err) {
    return { error: err.message || "Sesi telah berakhir atau kamu belum login. Silakan login kembali." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { success: true, message: "Password berhasil diganti." };
}

export async function tambahProduk(formData) {
  const { supabase } = await pastikanAdminSudahLogin();

  const nama = formData.get("nama")?.toString().trim();
  const harga = parseInt(formData.get("harga"), 10);
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama || isNaN(harga) || harga < 0) {
    throw new Error("Nama dan harga produk (minimal 0) wajib diisi.");
  }

  const { error } = await supabase.from("produk").insert([
    {
      nama,
      harga,
      kategori,
      foto_url,
      deskripsi,
    },
  ]);

  if (error) {
    throw new Error(error.message || "Gagal menambah produk.");
  }

  redirect("/admin");
}

export async function ubahProduk(formData) {
  const { supabase } = await pastikanAdminSudahLogin();

  const id = formData.get("id");
  const nama = formData.get("nama")?.toString().trim();
  const harga = parseInt(formData.get("harga"), 10);
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!id || !nama || isNaN(harga) || harga < 0) {
    throw new Error("ID, nama, dan harga produk (minimal 0) wajib diisi.");
  }

  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      foto_url,
      deskripsi,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Gagal mengubah produk.");
  }

  redirect("/admin");
}

export async function hapusProduk(formData) {
  const { supabase } = await pastikanAdminSudahLogin();

  const id = formData.get("id");
  if (!id) {
    throw new Error("ID produk tidak valid.");
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    throw new Error(error.message || "Gagal menghapus produk.");
  }

  redirect("/admin");
}
