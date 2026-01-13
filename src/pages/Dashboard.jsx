import { useEffect, useState } from "react";
// Import file modular yang baru kita buat
import AdminDashboard from "../components/AdminDashboard"; // Sesuaikan pathnya
import UserDashboard from "../components/UserDashboard"; // Sesuaikan pathnya

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Ambil data dari localStorage
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // Tidak perlu redirect manual di sini.
    // Jika user tidak ada, App.jsx yang akan menendang ke /login secara otomatis.
  }, []);

  const handleLogout = () => {
    if (window.confirm("Keluar dari aplikasi?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          {sidebarOpen ? (
            <h1 className="text-xl font-black text-white tracking-tight">
              HERIS
            </h1>
          ) : (
            <span className="font-bold text-xl text-blue-400">H</span>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          <button
            onClick={() => setActiveMenu("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              activeMenu === "dashboard"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className={`${!sidebarOpen && "hidden"} font-medium`}>
              {user.role === "Admin" ? "Monitoring" : "My Dashboard"}
            </span>
          </button>
          <button
            onClick={() => setActiveMenu("spd")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              activeMenu === "spd"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span className={`${!sidebarOpen && "hidden"} font-medium`}>
              My SPD
            </span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-slate-400 hover:text-red-400"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className={`${!sidebarOpen && "hidden"} font-medium`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-blue-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-gray-800">
                Hi, {user.nik}
              </div>
              <div className="text-[10px] bg-blue-50 text-blue-600 px-2 rounded-full font-bold uppercase inline-block">
                {user.role}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
              {user.nik.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {activeMenu === "spd" ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Modul SPD</h2>
              <p className="text-gray-500">
                Fitur Pengajuan Dinas (SPD) segera hadir.
              </p>
            </div>
          ) : /* INI LOGIC SWITCHINGNYA */
          user.role === "Admin" ? (
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
