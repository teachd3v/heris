import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import AdminDashboard from "../components/AdminDashboard";
import UserDashboard from "../components/UserDashboard";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  // State Sidebar: Default true hanya jika layar lebar (Desktop)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [photoUrl, setPhotoUrl] = useState(null);

  // 1. Cek User Login
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      window.location.href = "/login";
    }
  }, []);

  // 2. Fetch Foto Profil
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!user?.nik) return;
      try {
        const { data } = await supabase
          .from("master_pekerjaan")
          .select("master_personal:no_ktp(foto_profil)")
          .eq("nik", user.nik)
          .single();

        if (data?.master_personal?.foto_profil) {
          setPhotoUrl(data.master_personal.foto_profil);
        }
      } catch (error) {
        console.error("Gagal load foto profil:", error);
      }
    };
    fetchProfilePhoto();
  }, [user]);

  // 3. Listener Resize: Agar sidebar otomatis menyesuaikan saat rotasi layar / resize browser
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false); // Otomatis tutup di HP
      } else {
        setSidebarOpen(true); // Otomatis buka di Desktop
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    toast.info("Sedang keluar...", { duration: 1000 });
    setTimeout(() => {
      localStorage.clear();
      toast.success("Berhasil keluar dari sistem");
      window.location.href = "/";
    }, 1000);
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // Helper Class Menu
  const menuItemClass = (menuName) => `
    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
    ${
      activeMenu === menuName
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }
  `;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
      {/* --- BACKDROP (MOBILE ONLY) --- 
          Layar gelap di belakang sidebar saat dibuka di HP 
      */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)} // Klik gelap -> Tutup Sidebar
          className="fixed inset-0 bg-black/50 z-20 md:hidden animate-in fade-in duration-300"
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed md:relative z-30 h-full bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl
          ${sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0 md:w-24"}
        `}
      >
        {/* HEADER SIDEBAR */}
        <div
          className={`flex flex-col justify-center items-center ${
            sidebarOpen ? "p-6" : "p-4"
          } border-b border-slate-800/50 transition-all duration-300 h-32 shrink-0`}
        >
          {sidebarOpen ? (
            <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
              <img
                src="/logo.png"
                alt="HERIS Logo"
                className="h-10 w-auto mb-2 object-contain"
              />
              <p className="text-[10px] text-slate-400 font-medium leading-tight tracking-wide max-w-[150px]">
                Human Edunesia Resource Information System
              </p>
            </div>
          ) : (
            <img
              src="/logo.png"
              alt="HERIS Logo"
              className="h-10 w-10 object-contain animate-in fade-in duration-300"
            />
          )}
        </div>

        {/* MENU */}
        <nav className="flex-1 py-6 px-4 space-y-3 overflow-y-auto scrollbar-hide">
          <button
            onClick={() => {
              setActiveMenu("dashboard");
              toast.dismiss();
              // Di HP, kalau pilih menu sebaiknya sidebar otomatis nutup
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className={menuItemClass("dashboard")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.5h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
            <span
              className={`${!sidebarOpen && "hidden md:block"} font-medium text-sm truncate transition-all duration-300`}
            >
              {user.role === "Admin" ? "Monitoring SDM" : "My Dashboard"}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveMenu("spd");
              toast.info("Modul SPD dalam pengembangan");
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className={menuItemClass("spd")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <span
              className={`${!sidebarOpen && "hidden md:block"} font-medium text-sm truncate transition-all duration-300`}
            >
              My SPD
            </span>
          </button>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-800/50 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 shrink-0 group-hover:translate-x-1 transition-transform"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            <span
              className={`${!sidebarOpen && "hidden md:block"} font-medium text-sm transition-all duration-300`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-100">
        {/* HEADER NAVBAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="transition-opacity hover:opacity-70 focus:outline-none"
          >
            <img
              src="/sidebar.png"
              alt="Toggle Sidebar"
              className="w-6 h-6 object-contain"
            />
          </button>

          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-black text-gray-900 leading-none mb-1">
                Hi, {user.nama || "User"}
              </div>
              <div className="flex justify-end gap-2 items-center">
                <span className="text-[11px] text-gray-500 font-medium font-mono bg-gray-100 px-1.5 rounded">
                  {user.nik}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${user.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            {/* AVATAR */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm text-white uppercase overflow-hidden ${!photoUrl ? (user.role === "Admin" ? "bg-purple-600" : "bg-blue-600") : "bg-gray-200"}`}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              ) : user.nama ? (
                user.nama.charAt(0)
              ) : (
                "?"
              )}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {activeMenu === "spd" ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-6 rotate-3 shadow-sm border border-blue-100">
                <svg
                  className="w-10 h-10 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Modul SPD
              </h2>
              <p className="text-slate-500 max-w-xs leading-relaxed text-sm">
                Fitur Pengajuan Surat Perintah Dinas sedang dalam tahap
                pengembangan.
              </p>
            </div>
          ) : user.role === "Admin" ? (
            <AdminDashboard />
          ) : (
            <UserDashboard currentUser={user} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
