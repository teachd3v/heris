import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

const ModalDetail = ({ isOpen, onClose, employee }) => {
  const [activeTab, setActiveTab] = useState("karir");

  if (!employee) return null;

  // Shortcut data personal untuk kemudahan akses
  const personal = employee.master_personal || {};
  const anakList = personal.master_anak || [];

  // Helper: Format Tanggal Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper: Gabung Alamat
  const fullAddress = [
    personal.alamat_domisili,
    personal.desa_kelurahan,
    personal.kecamatan,
    personal.kabupaten_kota,
    personal.provinsi,
  ]
    .filter(Boolean)
    .join(", ");

  const tabs = [
    { id: "karir", label: "Info Karir" },
    { id: "pribadi", label: "Data Pribadi" },
    { id: "keluarga", label: "Keluarga" },
    { id: "pendidikan", label: "Pendidikan & Payroll" },
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[2rem] bg-white text-left align-middle shadow-2xl transition-all">
                {/* --- HEADER --- */}
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

                  <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 z-10">
                    {/* FOTO PROFIL */}
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white/20 bg-slate-800 overflow-hidden shadow-lg flex-shrink-0">
                      {personal.foto_profil ? (
                        <img
                          src={personal.foto_profil}
                          alt="Foto Profil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-500">
                          {employee.nama?.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="text-center md:text-left flex-1">
                      <h3 className="text-3xl font-black tracking-tight">
                        {employee.nama}
                      </h3>
                      <p className="text-blue-200 font-medium text-lg mt-1">
                        {employee.jabatan}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono border border-white/10">
                          NIK: {employee.nik}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            employee.status_karyawan === "PKWTT"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {employee.status_karyawan}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="absolute top-0 right-0 md:static p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* --- TABS --- */}
                <div className="flex border-b border-gray-100 px-8 pt-4 gap-6 overflow-x-auto scrollbar-hide">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                        activeTab === tab.id
                          ? "text-blue-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></span>
                      )}
                    </button>
                  ))}
                </div>

                {/* --- CONTENT BODY --- */}
                <div className="p-8 bg-slate-50 min-h-[400px]">
                  {/* TAB 1: KARIR (UPDATED WITH CONTRACT LOGIC) */}
                  {activeTab === "karir" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                      <InfoCard
                        label="Level Jabatan"
                        value={employee.level}
                        icon="📊"
                      />
                      <InfoCard
                        label="Departemen"
                        value={employee.departemen}
                        icon="🏢"
                      />
                      <InfoCard
                        label="Divisi"
                        value={employee.divisi}
                        icon="📂"
                      />
                      <InfoCard
                        label="Bagian"
                        value={employee.bagian}
                        icon="🧩"
                      />
                      <InfoCard
                        label="Tanggal Masuk"
                        value={formatDate(employee.tgl_masuk)}
                        icon="📅"
                      />

                      {/* LOGIC TANGGAL KONTRAK / TETAP */}
                      {employee.status_karyawan === "Kontrak" ? (
                        <InfoCard
                          label="AKHIR KONTRAK"
                          value={formatDate(employee.tgl_akhir_kontrak)}
                          icon="⏳"
                          variant="warning"
                        />
                      ) : (
                        <InfoCard
                          label="TANGGAL PENETAPAN"
                          value={formatDate(employee.tgl_tetap)}
                          icon="📜"
                          variant="success"
                        />
                      )}

                      {/* Atasan Langsung */}
                      <div className="md:col-span-2">
                        <InfoCard
                          label="Atasan Langsung"
                          value={employee.nama_atasan || "-"}
                          icon="👔"
                          subValue={
                            employee.nik_atasan
                              ? `NIK: ${employee.nik_atasan}`
                              : ""
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PRIBADI */}
                  {activeTab === "pribadi" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard label="No. KTP" value={personal.no_ktp} />
                        <InfoCard
                          label="Tempat, Tgl Lahir"
                          value={`${personal.tempat_lahir || ""}, ${formatDate(personal.tanggal_lahir)}`}
                        />
                        <InfoCard
                          label="Jenis Kelamin"
                          value={personal.jenis_kelamin}
                        />
                        <InfoCard
                          label="Golongan Darah"
                          value={personal.golongan_darah}
                        />
                        <InfoCard
                          label="Email Pribadi"
                          value={personal.email_pribadi}
                          isEmail
                        />
                        <InfoCard
                          label="No. WhatsApp"
                          value={personal.kontak}
                        />
                      </div>

                      {/* Section Alamat */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">
                          Alamat Domisili
                        </h4>
                        <p className="text-slate-800 font-medium leading-relaxed">
                          {fullAddress || "Belum dilengkapi"}
                        </p>
                      </div>

                      {/* Section SIM */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">
                          Dokumen Mengemudi
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {personal.sim_a && (
                            <SimBadge type="A" number={personal.sim_a} />
                          )}
                          {personal.sim_b && (
                            <SimBadge type="B" number={personal.sim_b} />
                          )}
                          {personal.sim_c && (
                            <SimBadge type="C" number={personal.sim_c} />
                          )}
                          {!personal.sim_a &&
                            !personal.sim_b &&
                            !personal.sim_c && (
                              <span className="text-slate-400 text-sm italic">
                                Tidak ada data SIM
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: KELUARGA */}
                  {activeTab === "keluarga" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                      {/* Info Pasangan */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard
                          label="Status Pernikahan"
                          value={personal.status_pernikahan}
                        />
                        {personal.status_pernikahan === "Menikah" && (
                          <>
                            <InfoCard
                              label="Nama Pasangan"
                              value={personal.nama_pasangan}
                            />
                            <InfoCard
                              label="Tanggal Menikah"
                              value={formatDate(personal.tanggal_pernikahan)}
                            />
                            <InfoCard
                              label="Kontak Pasangan"
                              value={personal.kontak_pasangan}
                            />
                          </>
                        )}
                        <InfoCard
                          label="Kontak Darurat"
                          value={`${personal.nama_kontak_keluarga || ""} (${personal.hubungan_keluarga || ""})`}
                          subValue={personal.kontak_keluarga}
                        />
                      </div>

                      {/* Tabel Anak */}
                      {personal.status_pernikahan !== "Belum Menikah" && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                          <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-700 text-sm">
                            Data Anak ({anakList.length})
                          </div>
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                              <tr>
                                <th className="px-5 py-3 font-semibold">
                                  Nama Anak
                                </th>
                                <th className="px-5 py-3 font-semibold">TTL</th>
                                <th className="px-5 py-3 font-semibold">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {anakList.length > 0 ? (
                                anakList.map((anak) => (
                                  <tr key={anak.id}>
                                    <td className="px-5 py-3 font-medium text-slate-800">
                                      {anak.nama_anak}
                                    </td>
                                    <td className="px-5 py-3 text-slate-600">
                                      {anak.tempat_lahir},{" "}
                                      {formatDate(anak.tanggal_lahir)}
                                    </td>
                                    <td className="px-5 py-3">
                                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                                        {anak.status_kegiatan}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="3"
                                    className="px-5 py-4 text-center text-slate-400"
                                  >
                                    Tidak ada data anak
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: PENDIDIKAN & PAYROLL */}
                  {activeTab === "pendidikan" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          🎓 Pendidikan Terakhir
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoCard
                            label="Jenjang"
                            value={personal.tingkat_pendidikan_terakhir}
                          />
                          <InfoCard
                            label="Institusi"
                            value={personal.institusi_pendidikan}
                          />
                          <div className="md:col-span-2">
                            <InfoCard
                              label="Jurusan"
                              value={personal.jurusan_pendidikan}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-full blur-2xl"></div>
                        <h4 className="font-bold text-blue-200 mb-6 flex items-center gap-2">
                          💳 Data Payroll
                        </h4>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                              Nama Bank
                            </p>
                            <p className="text-xl font-bold">
                              {employee.bank || "-"}
                            </p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                              Nomor Rekening
                            </p>
                            <p className="text-2xl font-mono tracking-widest">
                              {employee.nomor_bank || "-"}
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                              {employee.nama_akun}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Sub-components dengan dukungan Variant Warna
const InfoCard = ({ label, value, icon, subValue, isEmail, variant }) => {
  const getVariantClass = () => {
    if (variant === "warning")
      return "bg-amber-50 border-amber-100 hover:border-amber-300";
    if (variant === "success")
      return "bg-emerald-50 border-emerald-100 hover:border-emerald-300";
    return "bg-white border-slate-100 hover:border-blue-100";
  };

  const getLabelClass = () => {
    if (variant === "warning") return "text-amber-500";
    if (variant === "success") return "text-emerald-500";
    return "text-slate-400";
  };

  return (
    <div
      className={`p-4 rounded-xl border shadow-sm transition-colors ${getVariantClass()}`}
    >
      <div className="flex items-start justify-between mb-1">
        <span
          className={`text-xs font-bold uppercase tracking-wide ${getLabelClass()}`}
        >
          {label}
        </span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className={`font-bold text-slate-800 ${isEmail ? "break-all" : ""}`}>
        {value || "-"}
      </div>
      {subValue && (
        <div className="text-sm text-slate-500 mt-1">{subValue}</div>
      )}
    </div>
  );
};

const SimBadge = ({ type, number }) => (
  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
    <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs shadow-sm">
      SIM {type}
    </div>
    <div className="font-mono text-sm font-semibold text-blue-900">
      {number}
    </div>
  </div>
);

export default ModalDetail;
