import { useEffect, useState } from "react";
import { db } from "../lib/db";
import { toast } from "sonner";
import ModalDetail from "./ModalDetail";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- STATS CARDS (Updated Colors & Icons) ---
  const stats = [
    {
      label: "Total Karyawan",
      value: employees.length,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      ),
    },
    {
      label: "Karyawan Tetap",
      // Filter string "Tetap"
      value: employees.filter((e) => e.status_karyawan === "Tetap").length,
      color: "bg-amber-500", // Orange
      textColor: "text-amber-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      ),
    },
    {
      label: "Karyawan Kontrak",
      // Filter string "Kontrak"
      value: employees.filter((e) => e.status_karyawan === "Kontrak").length,
      color: "bg-emerald-500", // Hijau
      textColor: "text-emerald-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // FETCH DATA pakai SQL Join (Lebih powerful & hemat query)
      const data = await db`
        SELECT 
          pk.*,
          p.nama_lengkap,
          p.foto_profil,
          p.tempat_lahir,
          p.tanggal_lahir,
          p.jenis_kelamin,
          p.email_pribadi,
          p.kontak,
          p.alamat_domisili,
          (
            SELECT json_agg(a.*) 
            FROM master_anak a 
            WHERE a.no_ktp_ortu = p.no_ktp
          ) as master_anak
        FROM master_pekerjaan pk
        LEFT JOIN master_personal p ON pk.no_ktp = p.no_ktp
        ORDER BY pk.nama ASC
      `;

      // 2. BUAT LOOKUP MAP (NIK -> NAMA) untuk Atasan
      const nikToName = {};
      data.forEach((emp) => {
        if (emp.nik) {
          nikToName[emp.nik] = emp.nama || emp.nama_lengkap || "Tanpa Nama";
        }
      });

      // 3. ENRICH DATA
      const enrichedData = data.map((emp) => ({
        ...emp,
        nama_atasan: emp.nik_atasan
          ? nikToName[emp.nik_atasan] || `NIK: ${emp.nik_atasan}`
          : "-",
        // Kembalikan struktur master_personal agar ModalDetail tidak error
        master_personal: {
          nama_lengkap: emp.nama_lengkap,
          foto_profil: emp.foto_profil,
          tempat_lahir: emp.tempat_lahir,
          tanggal_lahir: emp.tanggal_lahir,
          jenis_kelamin: emp.jenis_kelamin,
          email_pribadi: emp.email_pribadi,
          kontak: emp.kontak,
          alamat_domisili: emp.alamat_domisili,
          master_anak: emp.master_anak || []
        }
      }));

      setEmployees(enrichedData);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data karyawan");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const search = searchTerm.toLowerCase();
    return (
      (emp.nama || "").toLowerCase().includes(search) ||
      (emp.nik || "").toLowerCase().includes(search) ||
      (emp.jabatan || "").toLowerCase().includes(search)
    );
  });

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Stats */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
          Monitoring SDM
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all"
            >
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-black text-slate-800">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center ${stat.textColor}`}
              >
                {stat.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Daftar Karyawan</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari Nama / NIK / Jabatan..."
              className="pl-10 pr-4 py-2.5 w-full md:w-72 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Karyawan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Jabatan & Divisi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.nik}
                    onClick={() => handleRowClick(emp)}
                    className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden border-2 border-white shadow-sm group-hover:border-blue-200">
                          {emp.master_personal?.foto_profil ? (
                            <img
                              src={emp.master_personal.foto_profil}
                              alt={emp.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (emp.nama || "?").charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                            {emp.nama}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {emp.nik}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">
                        {emp.jabatan}
                      </div>
                      <div className="text-xs text-slate-500">{emp.divisi}</div>
                    </td>
                    <td className="px-6 py-4">
                      {/* LOGIC WARNA BARU: Tetap (Orange), Kontrak (Hijau) */}
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                          emp.status_karyawan === "Tetap"
                            ? "bg-amber-50 text-amber-700 border-amber-100" // Orange for Tetap
                            : "bg-emerald-50 text-emerald-700 border-emerald-100" // Green for Kontrak
                        }`}
                      >
                        {emp.status_karyawan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalDetail
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default AdminDashboard;
