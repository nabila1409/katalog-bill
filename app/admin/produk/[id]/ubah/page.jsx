import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatKlienSesiAdmin } from "@/lib/supabase/auth";
import { ubahProduk } from "@/app/admin/actions";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const supabase = await buatKlienSesiAdmin();

  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk produk={produk} action={ubahProduk} labelTombol="Simpan perubahan" />
    </div>
  );
}
