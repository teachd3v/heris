import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ModalDetail from "./ModalDetail"; // IMPORT MODAL BARU

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    // Pastikan query-nya lengkap biar ModalDetail dapet semua datanya
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

    if (data) setEmployees(data);
    setLoading(false);
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-gray-400">
        Sedang memuat data SDM...
      </div>
    );

  return (
    <div className="animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Monitoring SDM</h2>
          <p className="text-sm text-gray-500">Data seluruh karyawan aktif</p>
        </div>
        <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold shadow-sm">
          Total: {employees.length} Pegawai
        </span>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b">
              <tr>
                <th className="px-6 py-4">Karyawan</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr
                  key={emp.nik}
                  className="hover:bg-blue-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${
                          emp.status_karyawan === "Tetap"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {getInitial(emp.master_personal?.nama_lengkap)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {emp.master_personal?.nama_lengkap || "Tanpa Nama"}
                        </div>
                        <div className="text-xs text-gray-500">{emp.nik}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">
                      {emp.jabatan}
                    </div>
                    <div className="text-xs text-gray-500">{emp.divisi}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold border ${
                        emp.status_karyawan === "Tetap"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {emp.status_karyawan || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedEmp(emp)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANGGIL KOMPONEN MODAL DETAIL DISINI */}
      {selectedEmp && (
        <ModalDetail
          employee={selectedEmp}
          allEmployees={employees} // <--- TAMBAHAN: Kirim data semua karyawan
          onClose={() => setSelectedEmp(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
