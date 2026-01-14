import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ModalDetail from "./ModalDetail";

const AdminDashboard = () => {
  // --- STATE ---
  const [allEmployees, setAllEmployees] = useState([]); // Menyimpan SEMUA data asli
  const [filteredEmployees, setFilteredEmployees] = useState([]); // Menyimpan data hasil search
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State Statistik
  const [stats, setStats] = useState({
    total: 0,
    tetap: 0,
    kontrak: 0,
  });

  // --- FETCH DATA (SEKALI SAJA) ---
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // PERBAIKAN: Tambahkan * di dalam master_personal
      const { data, error } = await supabase
        .from("master_pekerjaan")
        .select(
          `
          nik, jabatan, divisi, departemen, level, status_karyawan, tgl_masuk, email_kantor, no_ktp, nik_atasan,
          master_personal:no_ktp (
            *, 
            master_anak (*)
          )
        `
        )
        .order("nik", { ascending: true });

      if (error) throw error;

      if (data) {
        setAllEmployees(data);
        setFilteredEmployees(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HITUNG STATISTIK DI CLIENT SIDE ---
  const calculateStats = (data) => {
    const total = data.length;
    const tetap = data.filter((emp) => emp.status_karyawan === "Tetap").length;
    const kontrak = total - tetap; // Sisanya dianggap kontrak/probation

    setStats({ total, tetap, kontrak });
  };

  // --- LOGIKA SEARCH (REALTIME) ---
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEmployees(allEmployees);
    } else {
      const lowerTerm = searchTerm.toLowerCase();

      const filtered = allEmployees.filter((emp) => {
        const nama = emp.master_personal?.nama_lengkap?.toLowerCase() || "";
        const nik = emp.nik?.toLowerCase() || "";
        const jabatan = emp.jabatan?.toLowerCase() || "";
        const status = emp.status_karyawan?.toLowerCase() || "";
        const divisi = emp.divisi?.toLowerCase() || "";

        // Cari di Nama ATAU NIK ATAU Jabatan ATAU Status ATAU Divisi
        return (
          nama.includes(lowerTerm) ||
          nik.includes(lowerTerm) ||
          jabatan.includes(lowerTerm) ||
          status.includes(lowerTerm) ||
          divisi.includes(lowerTerm)
        );
      });

      setFilteredEmployees(filtered);
    }
  }, [searchTerm, allEmployees]);

  // --- HELPER ---
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <div className="animate-in fade-in duration-500 pb-20 space-y-8">
      {/* HEADER & INFOGRAFIS */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">
          Monitoring SDM
        </h2>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Karyawan
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {stats.total}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Tetap */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Karyawan Tetap
              </p>
              <h3 className="text-3xl font-black text-green-600 mt-1">
                {stats.tetap}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Kontrak */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Karyawan Kontrak
              </p>
              <h3 className="text-3xl font-black text-amber-500 mt-1">
                {stats.kontrak}
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* SEARCH BAR */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h3 className="font-bold text-slate-800 text-lg">
            List Data Karyawan
          </h3>

          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Cari Nama / NIK / Jabatan / Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm shadow-sm"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* LOADING & TABLE */}
        {loading ? (
          <div className="p-20 text-center space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-400 animate-pulse font-medium">
              Menarik seluruh data karyawan...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5">Karyawan</th>
                  <th className="px-6 py-5">Jabatan & Divisi</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp.nik}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105 ${
                              emp.status_karyawan === "Tetap"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {getInitial(emp.master_personal?.nama_lengkap)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {emp.master_personal?.nama_lengkap ||
                                "Tanpa Nama"}
                            </div>
                            <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1 border border-gray-200">
                              {emp.nik}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">
                          {emp.jabatan || "-"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {emp.divisi}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            emp.status_karyawan === "Tetap"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {emp.status_karyawan || "Kontrak"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedEmp(emp)}
                          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 font-bold text-xs px-4 py-2 rounded-lg transition-all"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-16">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12 mb-3 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="italic">
                          Tidak ada data yang cocok dengan "{searchTerm}".
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER TOTAL DATA */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
          <span>
            Menampilkan <strong>{filteredEmployees.length}</strong> dari{" "}
            <strong>{allEmployees.length}</strong> data karyawan.
          </span>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedEmp && (
        <ModalDetail
          employee={selectedEmp}
          allEmployees={allEmployees} // Kirim semua data agar bisa cari nama atasan
          onClose={() => setSelectedEmp(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
