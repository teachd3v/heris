import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

const Login = () => {
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verifikasi User & Password di master_users
      const { data: userData, error: userError } = await supabase
        .from("master_users")
        .select("nik, password, role")
        .eq("nik", nik)
        .maybeSingle();

      if (userError) throw userError;

      if (!userData) {
        toast.error("NIK tidak terdaftar.");
      } else if (password === userData.password) {
        // 2. JEMBATAN: Ambil no_ktp dari master_pekerjaan berdasarkan nik
        const { data: kerjaData, error: kerjaError } = await supabase
          .from("master_pekerjaan")
          .select("no_ktp")
          .eq("nik", userData.nik)
          .maybeSingle();

        if (kerjaError) throw kerjaError;

        let namaFinal = "User";

        // 3. AMBIL NAMA dari master_personal berdasarkan no_ktp
        if (kerjaData?.no_ktp) {
          const { data: personalData } = await supabase
            .from("master_personal")
            .select("nama_lengkap")
            .eq("no_ktp", kerjaData.no_ktp)
            .maybeSingle();

          if (personalData?.nama_lengkap) {
            namaFinal = personalData.nama_lengkap;
          }
        }

        // 4. Simpan ke LocalStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            nik: userData.nik,
            role: userData.role,
            nama: namaFinal,
          })
        );

        toast.success(`Selamat datang, ${namaFinal}!`);

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast.error("Password salah.");
      }
    } catch (err) {
      console.error("Login Flow Error:", err);
      toast.error("Terjadi kesalahan saat sinkronisasi data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            HERIS
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Human Edunesia Resource Information System
          </p>
          <p className="text-gray-400 text-sm mt-2">Prototype v1.0</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
              NIK Karyawan
            </label>
            <input
              type="text"
              required
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
              placeholder="Contoh: 2023001"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-black hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Verifikasi...
              </>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Lupa password? Hubungi @hudagraph.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
