// src/components/ModalDetail.jsx

const ModalDetail = ({ employee, allEmployees, onClose }) => {
  if (!employee) return null;

  // --- Helper Functions ---
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970) + " Tahun";
  };

  const calculateTenure = (joinDate) => {
    if (!joinDate) return "-";
    const years = new Date().getFullYear() - new Date(joinDate).getFullYear();
    return years + " Tahun";
  };

  // --- LOGIC BARU: CARI NAMA ATASAN ---
  const getSupervisorName = (supervisorNik) => {
    if (!supervisorNik) return "-";

    // Cari karyawan di list allEmployees yang NIK-nya cocok dengan nik_atasan
    const supervisor = allEmployees?.find((emp) => emp.nik === supervisorNik);

    // Kalau ketemu, ambil namanya. Kalau gak ketemu (misal atasan udah resign), tampilkan NIK-nya aja
    return supervisor?.master_personal?.nama_lengkap
      ? `${supervisor.master_personal.nama_lengkap}`
      : `${supervisorNik} (Data tidak ditemukan)`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="bg-slate-900 p-6 text-white shrink-0 flex justify-between items-start">
          <div className="flex gap-5 items-center">
            <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold">
              {getInitial(employee.master_personal?.nama_lengkap)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {employee.master_personal?.nama_lengkap}
              </h2>
              <p className="text-white/60 text-sm mt-0.5">
                {employee.jabatan} • {employee.nik}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-xs border bg-blue-500/30 text-blue-100 border-blue-400/30">
                  {employee.level || "Staff"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs border ${
                    employee.status_karyawan === "Tetap"
                      ? "bg-green-500/30 text-green-100 border-green-400/30"
                      : "bg-orange-500/30 text-orange-100 border-orange-400/30"
                  }`}
                >
                  {employee.status_karyawan}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg
              className="h-6 w-6"
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

        {/* --- BODY --- */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* KOLOM 1: DATA PRIBADI */}
            <div className="space-y-6">
              <SectionTitle title="Data Pribadi" />
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                <InfoGroup label="No. KTP">{employee.no_ktp}</InfoGroup>
                <InfoGroup label="TTL / Usia">
                  {employee.master_personal?.tempat_lahir},{" "}
                  {formatDate(employee.master_personal?.tanggal_lahir)} <br />
                  <span className="text-xs text-blue-600 font-bold">
                    ({calculateAge(employee.master_personal?.tanggal_lahir)})
                  </span>
                </InfoGroup>
                <div className="grid grid-cols-2 gap-2">
                  <InfoGroup label="Gender">
                    {employee.master_personal?.jenis_kelamin}
                  </InfoGroup>
                  <InfoGroup label="Gol. Darah">
                    {employee.master_personal?.golongan_darah || "-"}
                  </InfoGroup>
                </div>
                <InfoGroup label="Alamat">
                  {employee.master_personal?.alamat_domisili}
                </InfoGroup>
                <InfoGroup label="No. HP">
                  {employee.master_personal?.kontak}
                </InfoGroup>
                <InfoGroup label="Email">
                  {employee.master_personal?.email_pribadi}
                </InfoGroup>
              </div>
            </div>

            {/* KOLOM 2: KELUARGA & ANAK */}
            <div className="space-y-6">
              <SectionTitle title="Data Keluarga" />

              <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    Status
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {employee.master_personal?.status_pernikahan}
                  </span>
                </div>
                {employee.master_personal?.status_pernikahan === "Menikah" && (
                  <div className="mt-3 pt-2 border-t border-dashed">
                    <InfoGroup label="Pasangan">
                      {employee.master_personal?.nama_pasangan}
                    </InfoGroup>
                    <InfoGroup label="Kontak Pasangan">
                      {employee.master_personal?.kontak_pasangan || "-"}
                    </InfoGroup>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-600 uppercase">
                    Data Anak
                  </span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-300">
                    {employee.master_personal?.master_anak?.length || 0}
                  </span>
                </div>
                <div className="bg-white max-h-48 overflow-y-auto">
                  {employee.master_personal?.master_anak?.length > 0 ? (
                    employee.master_personal.master_anak.map((anak, i) => (
                      <div
                        key={i}
                        className="p-3 border-b last:border-0 text-sm hover:bg-gray-50"
                      >
                        <div className="font-bold text-gray-800">
                          {anak.nama_anak}
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>{anak.jenis_kelamin}</span>
                          <span>{calculateAge(anak.tanggal_lahir)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400 italic">
                      Tidak ada data anak
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <SectionTitle
                  title="Kontak Darurat"
                  className="text-red-500 border-red-100 mb-2"
                />
                <div className="bg-red-50 p-3 rounded border border-red-100">
                  <p className="text-sm font-bold text-gray-800">
                    {employee.master_personal?.nama_kontak_keluarga || "-"}
                  </p>
                  <div className="flex justify-between mt-1 text-xs text-gray-600">
                    <span>{employee.master_personal?.hubungan_keluarga}</span>
                    <span>{employee.master_personal?.kontak_keluarga}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KOLOM 3: PEKERJAAN & BANK */}
            <div className="space-y-6">
              <SectionTitle title="Data Pekerjaan" />
              <div className="space-y-3">
                <InfoGroup label="Email Kantor">
                  {employee.email_kantor}
                </InfoGroup>
                <InfoGroup label="Departemen / Divisi">
                  {employee.departemen} / {employee.divisi}
                </InfoGroup>

                {/* BAGIAN ATASAN LANGSUNG (UPDATED) */}
                <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                  <InfoGroup label="Atasan Langsung">
                    <span className="text-indigo-900 font-bold">
                      {getSupervisorName(employee.nik_atasan)}
                    </span>
                  </InfoGroup>
                </div>

                <div className="p-3 bg-blue-50 rounded border border-blue-100 mt-2">
                  <InfoGroup label="Masa Kerja">
                    <span className="text-blue-700 font-bold text-lg block">
                      {calculateTenure(employee.tgl_masuk)}
                    </span>
                    <span className="text-xs text-blue-400 font-normal">
                      Tgl Masuk: {formatDate(employee.tgl_masuk)}
                    </span>
                  </InfoGroup>
                </div>
              </div>

              {/* KARTU BANK */}
              <div className="mt-8 pt-4 border-t border-dashed border-gray-200">
                <SectionTitle
                  title="Rekening Payroll"
                  className="text-emerald-600 border-emerald-100 mb-4"
                />
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 rounded-xl shadow-lg text-white relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-xs uppercase tracking-widest text-emerald-100">
                      Bank Name
                    </div>
                    <div className="font-bold text-lg italic tracking-wider">
                      {employee.master_personal?.bank || "BANK"}
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-[10px] uppercase text-emerald-100 mb-1">
                      Account Number
                    </div>
                    <div className="font-mono text-xl tracking-widest font-semibold text-white drop-shadow-md">
                      {employee.master_personal?.nomor_bank || "**** ****"}
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-white/20 flex justify-between items-end">
                    <div>
                      <div className="text-[10px] uppercase text-emerald-100">
                        Account Holder
                      </div>
                      <div className="font-medium text-sm truncate max-w-[150px]">
                        {employee.master_personal?.nama_akun || "NAMA KARYAWAN"}
                      </div>
                    </div>
                    <svg
                      width="30"
                      height="20"
                      viewBox="0 0 40 28"
                      fill="none"
                      className="opacity-80"
                    >
                      <rect
                        width="40"
                        height="28"
                        rx="4"
                        fill="#FCD34D"
                        fillOpacity="0.8"
                      />
                      <path d="M4 10H36" stroke="#B45309" strokeOpacity="0.5" />
                      <path d="M4 18H36" stroke="#B45309" strokeOpacity="0.5" />
                      <path d="M12 4V24" stroke="#B45309" strokeOpacity="0.5" />
                      <path d="M28 4V24" stroke="#B45309" strokeOpacity="0.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 bg-gray-50 border-t flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium shadow-sm transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ title }) => (
  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
    {title}
  </h3>
);

const InfoGroup = ({ label, children }) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </span>
    <div className="text-sm font-medium text-gray-900">{children || "-"}</div>
  </div>
);

export default ModalDetail;
