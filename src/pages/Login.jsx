import { useState } from "react";
import { supabase } from "../lib/supabase";

const Login = () => {
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Cek User di Database
      const { data, error } = await supabase
        .from("master_users")
        .select("*")
        .eq("nik", nik)
        .eq("password", password)
        .single();

      if (error || !data) {
        throw new Error("NIK atau Password salah.");
      }

      // Bagian di dalam handleLogin setelah data ditemukan
      if (data) {
        // 1. Simpan data user ke localStorage
        localStorage.setItem("user", JSON.stringify(data));

        // 2. Redirect paksa ke dashboard
        // Menggunakan window.location.href memastikan App.jsx memuat ulang status login
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Gagal masuk. Periksa kembali NIK dan Password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-gray-50">
      {/* --- 1. BACKGROUND VIDEO (LOCAL) --- */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
        >
          <source src="/login-bg.mp4" type="video/mp4" />
        </video>

        {/* Overlay Biru Cerah & Bersih */}
        <div className="absolute inset-0 bg-blue-600/40 mix-blend-multiply backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-white/10"></div>
      </div>

      {/* --- 2. LOGIN CARD --- */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/95 backdrop-blur-md px-8 py-10 shadow-2xl rounded-2xl border border-white/50 ring-1 ring-black/5">
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 text-white font-bold text-xl mb-4">
              H
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Sign in to HERIS
            </h2>
            <p className="mt-2 text-xs font-semibold text-blue-600 tracking-widest uppercase">
              Human Edunesia Resource Information System
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3">
              <svg
                className="h-5 w-5 text-red-500 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="nik"
                className="block text-sm font-bold text-gray-700 mb-1.5"
              >
                Nomor Induk Karyawan
              </label>
              <input
                id="nik"
                name="nik"
                type="text"
                required
                placeholder="Contoh: 12345678"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-blue-500/40"
                }`}
              >
                {loading ? "Memproses..." : "Masuk Aplikasi"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center space-y-1">
          <p className="text-white text-xs font-semibold drop-shadow-md opacity-90 tracking-wide">
            &copy; 2026 GREAT Edunesia. All rights reserved.
          </p>
          <p className="text-blue-200 text-[10px] opacity-75 font-medium tracking-wider">
            Designed & Developed by Hudagraph • HERIS v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
