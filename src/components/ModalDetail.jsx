import { useState } from "react";

const ModalDetail = ({ employee, allEmployees, onClose }) => {
  const [activeTab, setActiveTab] = useState("karir");

  if (!employee) return null;

  // --- HELPER FUNCTIONS ---
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateDuration = (dateString) => {
    if (!dateString) return "-";
    const start = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) return `${years} Tahun ${months} Bulan`;
    return `${months} Bulan`;
  };

  const getSupervisorName = (supervisorNik) => {
    if (!supervisorNik) return "-";
    const supervisor = allEmployees?.find((emp) => emp.nik === supervisorNik);
    return supervisor?.master_personal?.nama_lengkap
      ? `${supervisor.master_personal.nama_lengkap} (${supervisor.jabatan})`
      : supervisorNik;
  };

  const personal = employee.master_personal || {};
  const anakList = personal.master_anak || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* --- HEADER --- */}
        <div className="bg-slate-900 text-white p-8 flex justify-between items-start shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full -translate-y-40 translate-x-20 blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl ring-4 ring-white/10 ${
                employee.status_karyawan === "Tetap"
                  ? "bg-gradient-to-br from-blue-500 to-blue-700"
                  : "bg-gradient-to-br from-amber-400 to-amber-600"
              }`}
            >
              {getInitial(personal.nama_lengkap)}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {personal.nama_lengkap || "Tanpa Nama"}
              </h2>
              <p className="text-blue-200 font-medium text-lg">
                {employee.jabatan || "-"}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">
                  NIK: {employee.nik}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm ${
                    employee.status_karyawan === "Tetap"
                      ? "bg-green-400"
                      : "bg-amber-400"
                  }`}
                >
                  {employee.status_karyawan}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white/80 hover:text-white"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* --- TABS --- */}
        <div className="flex border-b border-gray-100 px-8 pt-4 bg-white shrink-0 overflow-x-auto">
          {[
            { id: "karir", label: "Karir & Pekerjaan" },
            { id: "pribadi", label: "Data Pribadi" },
            { id: "keluarga", label: "Keluarga & Anak" },
            { id: "lainnya", label: "Pendidikan & Payroll" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold border-b-4 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          {/* TAB 1: KARIR */}
          {activeTab === "karir" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
              <CardSection title="Informasi Posisi">
                <InfoRow label="Divisi" value={employee.divisi} />
                <InfoRow label="Departemen" value={employee.departemen} />
                <InfoRow label="Level Jabatan" value={employee.level} />
                <InfoRow
                  label="Atasan Langsung"
                  value={getSupervisorName(employee.nik_atasan)}
                />
              </CardSection>

              <CardSection title="Masa Kerja">
                <InfoRow
                  label="Tanggal Masuk"
                  value={formatDate(employee.tgl_masuk)}
                />
                <InfoRow
                  label="Masa Kerja"
                  value={calculateDuration(employee.tgl_masuk)}
                />
                <InfoRow
                  label="Status Kepegawaian"
                  value={employee.status_karyawan}
                />
                <InfoRow
                  label="Email Kantor"
                  value={employee.email_kantor}
                  isEmail
                />
              </CardSection>
            </div>
          )}

          {/* TAB 2: PRIBADI */}
          {activeTab === "pribadi" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
              <CardSection title="Identitas KTP">
                <InfoRow label="Nomor KTP" value={personal.no_ktp} />
                <InfoRow label="Nama Lengkap" value={personal.nama_lengkap} />
                <InfoRow label="Tempat Lahir" value={personal.tempat_lahir} />
                <InfoRow
                  label="Tanggal Lahir"
                  value={formatDate(personal.tanggal_lahir)}
                />
                <InfoRow label="Jenis Kelamin" value={personal.jenis_kelamin} />
                <InfoRow
                  label="Golongan Darah"
                  value={personal.golongan_darah}
                />
              </CardSection>

              <CardSection title="Kontak & Alamat">
                <InfoRow
                  label="Email Pribadi"
                  value={personal.email_pribadi}
                  isEmail
                />
                <InfoRow
                  label="Nomor HP/WA"
                  value={personal.kontak || personal.no_hp}
                />
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Alamat Domisili
                  </p>
                  <p className="text-gray-800 font-medium leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {personal.alamat_domisili || personal.alamat_ktp || "-"}
                  </p>
                </div>
              </CardSection>
            </div>
          )}

          {/* TAB 3: KELUARGA */}
          {activeTab === "keluarga" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <CardSection title="Data Pasangan">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow
                    label="Status Pernikahan"
                    value={personal.status_pernikahan}
                  />
                  <InfoRow
                    label="Nama Pasangan"
                    value={personal.nama_pasangan}
                  />
                  <InfoRow
                    label="Kontak Pasangan"
                    value={personal.kontak_pasangan}
                  />
                  <InfoRow
                    label="Kontak Darurat"
                    value={`${personal.nama_kontak_keluarga || "-"} (${
                      personal.kontak_keluarga || "-"
                    })`}
                  />
                </div>
              </CardSection>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">
                    Daftar Anak ({anakList.length})
                  </h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b">
                    <tr>
                      <th className="px-6 py-3">Nama Anak</th>
                      <th className="px-6 py-3">Tgl Lahir</th>
                      <th className="px-6 py-3">Pendidikan/Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {anakList.length > 0 ? (
                      anakList.map((anak, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-medium text-gray-900">
                            {anak.nama_anak}
                          </td>
                          <td className="px-6 py-3 text-gray-600">
                            {formatDate(anak.tanggal_lahir)}
                          </td>
                          <td className="px-6 py-3">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                              {anak.status_kegiatan || "-"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-8 text-center text-gray-400 italic"
                        >
                          Tidak ada data anak
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: LAINNYA (Updated: 3 Columns & BSI Card) */}
          {activeTab === "lainnya" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
              {/* KOLOM 1: PENDIDIKAN */}
              <CardSection title="Riwayat Pendidikan">
                <div className="space-y-4">
                  <InfoRow
                    label="Jenjang"
                    value={personal.tingkat_pendidikan_terakhir}
                  />
                  <InfoRow
                    label="Institusi"
                    value={personal.institusi_pendidikan}
                  />
                  <InfoRow
                    label="Jurusan"
                    value={personal.jurusan_pendidikan}
                  />
                </div>
              </CardSection>

              {/* KOLOM 2: DATA SIM */}
              <CardSection title="Data SIM">
                <div className="flex flex-col gap-3 h-full justify-center">
                  {["A", "B", "C"].map((type) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-gray-100"
                    >
                      <span className="text-xs font-black text-gray-400 w-8">
                        SIM {type}
                      </span>
                      <span className="font-bold text-gray-800 text-sm">
                        {personal[`sim_${type.toLowerCase()}`] || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardSection>

              {/* KOLOM 3: BSI CARD (IMAGE BACKGROUND) */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-5 bg-teal-600 rounded-full"></span>
                  Rekening Payroll
                </h3>

                {/* --- KARTU BSI IMAGE BASED --- */}
                <div className="relative w-full aspect-[1.586/1] rounded-2xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                  {/* 1. BACKGROUND IMAGE */}
                  {/* Pastikan file 'bsi-card.png' ada di folder public */}
                  <img
                    src="/bsi-card.png"
                    alt="Kartu BSI"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* 2. TEXT OVERLAY LAYER */}
                  {/* Kita gunakan absolute positioning untuk menempatkan teks tepat di atas gambar */}
                  <div className="relative z-10 w-full h-full text-white/90 font-mono tracking-widest drop-shadow-md">
                    {/* NOMOR REKENING (Posisi Tengah - Agak Bawah) */}
                    <div className="absolute top-[60%] left-[8%] w-full">
                      <p className="text-lg md:text-xl lg:text-2xl font-bold tracking-[0.15em] text-black/95 text-shadow-sm">
                        {personal.nomor_bank
                          ? personal.nomor_bank.replace(/(.{4})/g, "$1 ").trim()
                          : "•••• •••• •••• ••••"}
                      </p>
                    </div>

                    {/* NAMA HOLDER (Posisi Kiri Bawah) */}
                    <div className="absolute bottom-[10%] left-[8%] max-w-[60%]">
                      <p className="uppercase font-medium text-xs md:text-sm truncate tracking-widest text-black/90">
                        {personal.nama_akun ||
                          personal.nama_lengkap ||
                          "NAMA KARYAWAN"}
                      </p>
                    </div>
                  </div>

                  {/* Efek Kilau/Glossy (Opsional - Biar makin real) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>

                <p className="text-[10px] text-center text-gray-400 px-4 mt-2">
                  *Pastikan nomor rekening aktif untuk proses payroll.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---
const CardSection = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full hover:shadow-md transition-shadow">
    <h3 className="font-bold text-lg text-slate-800 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
      <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const InfoRow = ({ label, value, isEmail }) => (
  <div className="flex justify-between items-start group py-1">
    <span className="text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors w-1/3">
      {label}
    </span>
    <span
      className={`text-sm font-bold text-gray-800 w-2/3 text-right break-words ${
        isEmail ? "lowercase" : ""
      }`}
    >
      {value || "-"}
    </span>
  </div>
);

export default ModalDetail;
