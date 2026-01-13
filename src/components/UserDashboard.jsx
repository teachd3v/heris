import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const UserDashboard = ({ currentUser }) => {
  const [personalData, setPersonalData] = useState({});
  const [childrenList, setChildrenList] = useState([]);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  const [newChild, setNewChild] = useState({
    nama_anak: "",
    no_ktp_anak: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "Laki-laki",
    status_kegiatan: "Belum Sekolah",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (currentUser?.nik) fetchMyData();
  }, [currentUser]);

  const fetchMyData = async () => {
    const { data } = await supabase
      .from("master_pekerjaan")
      .select(`no_ktp, master_personal:no_ktp ( *, master_anak (*) )`)
      .eq("nik", currentUser.nik)
      .single();

    if (data?.master_personal) {
      setPersonalData(data.master_personal);
      setChildrenList(data.master_personal.master_anak || []);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setPersonalData({ ...personalData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const { master_anak, ...cleanData } = personalData;

    const { error } = await supabase
      .from("master_personal")
      .update(cleanData)
      .eq("no_ktp", personalData.no_ktp);

    if (!error) alert("Profil berhasil diperbarui!");
    else alert("Gagal: " + error.message);
    setUpdating(false);
  };

  // --- FUNGSI CRUD ANAK ---
  const resetChildForm = () => {
    setIsAddingChild(false);
    setEditingChildId(null);
    setNewChild({
      nama_anak: "",
      no_ktp_anak: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      jenis_kelamin: "Laki-laki",
      status_kegiatan: "Belum Sekolah",
    });
  };

  const handleEditChild = (child) => {
    setNewChild(child);
    setEditingChildId(child.id);
    setIsAddingChild(true);
    window.scrollTo({
      top: document.getElementById("section-anak").offsetTop - 50,
      behavior: "smooth",
    });
  };

  const handleSaveChild = async () => {
    if (!newChild.nama_anak || !newChild.tanggal_lahir)
      return alert("Nama dan Tanggal Lahir wajib diisi");

    if (editingChildId) {
      const { error } = await supabase
        .from("master_anak")
        .update(newChild)
        .eq("id", editingChildId);

      if (!error) {
        setChildrenList(
          childrenList.map((c) =>
            c.id === editingChildId ? { ...newChild } : c
          )
        );
        resetChildForm();
      } else alert("Gagal Update: " + error.message);
    } else {
      const { data, error } = await supabase
        .from("master_anak")
        .insert([{ ...newChild, parent_no_ktp: personalData.no_ktp }])
        .select();

      if (data) {
        setChildrenList([...childrenList, data[0]]);
        resetChildForm();
      } else alert("Gagal Tambah: " + error.message);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-gray-400 font-medium">
        Memuat data profil...
      </div>
    );

  // Reusable Tailwind Classes untuk konsistensi
  const labelClass =
    "block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5";
  const inputClass =
    "block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all outline-none";

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 lg:px-8 bg-white shadow-sm rounded-2xl border border-gray-100 my-8">
      <form onSubmit={handleUpdate} className="space-y-16">
        {/* SECTION 1: IDENTITAS PRIBADI */}
        <section>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Identitas Pribadi
            </h2>
            <p className="text-sm text-gray-500">
              Data utama sesuai dengan KTP anda.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Nama Lengkap</label>
              <input
                type="text"
                name="nama_lengkap"
                value={personalData.nama_lengkap || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>NIK KTP (Terkunci)</label>
              <input
                type="text"
                value={personalData.no_ktp || ""}
                disabled
                className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`}
              />
            </div>
            <div>
              <label className={labelClass}>Tempat Lahir</label>
              <input
                type="text"
                name="tempat_lahir"
                value={personalData.tempat_lahir || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tanggal Lahir</label>
              <input
                type="date"
                name="tanggal_lahir"
                value={personalData.tanggal_lahir || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Jenis Kelamin</label>
              <select
                name="jenis_kelamin"
                value={personalData.jenis_kelamin || ""}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Golongan Darah</label>
              <input
                type="text"
                name="golongan_darah"
                value={personalData.golongan_darah || ""}
                onChange={handleChange}
                className={inputClass}
                placeholder="A / B / AB / O"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Email Pribadi</label>
              <input
                type="email"
                name="email_pribadi"
                value={personalData.email_pribadi || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Nomor WhatsApp (Kontak)</label>
              <input
                type="text"
                name="kontak"
                value={personalData.kontak || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-4">
              <label className={labelClass}>Alamat Domisili</label>
              <textarea
                name="alamat_domisili"
                rows={2}
                value={personalData.alamat_domisili || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: PENDIDIKAN TERAKHIR */}
        <section>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Riwayat Pendidikan
            </h2>
            <p className="text-sm text-gray-500">
              Data pendidikan formal terakhir.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Tingkat Pendidikan</label>
              <select
                name="tingkat_pendidikan_terakhir"
                value={personalData.tingkat_pendidikan_terakhir || ""}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Pilih</option>
                <option value="SMA">SMA/Sederajat</option>
                <option value="D3">Diploma 3 (D3)</option>
                <option value="D4">Diploma 4 (D4)</option>
                <option value="S1">Sarjana (S1)</option>
                <option value="S2">Magister (S2)</option>
                <option value="S3">Doktor (S3)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Institusi / Universitas</label>
              <input
                type="text"
                name="institusi_pendidikan"
                value={personalData.institusi_pendidikan || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Jurusan</label>
              <input
                type="text"
                name="jurusan_pendidikan"
                value={personalData.jurusan_pendidikan || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: KELUARGA & PASANGAN */}
        <section>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Data Keluarga & Pasangan
            </h2>
            <p className="text-sm text-gray-500">
              Informasi pernikahan dan kontak pasangan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className={labelClass}>Status Pernikahan</label>
              <select
                name="status_pernikahan"
                value={personalData.status_pernikahan || ""}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Belum Menikah">Belum Menikah</option>
                <option value="Menikah">Menikah</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Tanggal Pernikahan</label>
              <input
                type="date"
                name="tanggal_pernikahan"
                value={personalData.tanggal_pernikahan || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Nama Pasangan</label>
              <input
                type="text"
                name="nama_pasangan"
                value={personalData.nama_pasangan || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Kontak Pasangan</label>
              <input
                type="text"
                name="kontak_pasangan"
                value={personalData.kontak_pasangan || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nama Kontak Keluarga</label>
              <input
                type="text"
                name="nama_kontak_keluarga"
                value={personalData.nama_kontak_keluarga || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Hubungan</label>
              <input
                type="text"
                name="hubungan_keluarga"
                value={personalData.hubungan_keluarga || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Nomor Kontak Keluarga</label>
              <input
                type="text"
                name="kontak_keluarga"
                value={personalData.kontak_keluarga || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: SIM */}
        <section>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Kepemilikan SIM</h2>
            <p className="text-sm text-gray-500">
              Input nomor SIM yang dimiliki (Kosongkan jika tidak ada).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Nomor SIM A</label>
              <input
                type="text"
                name="sim_a"
                value={personalData.sim_a || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nomor SIM B</label>
              <input
                type="text"
                name="sim_b"
                value={personalData.sim_b || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nomor SIM C</label>
              <input
                type="text"
                name="sim_c"
                value={personalData.sim_c || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: DATA ANAK (WITH EDIT FUNCTION) */}
        <section id="section-anak">
          <div className="border-b border-gray-200 pb-4 mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Data Anak</h2>
            <button
              type="button"
              onClick={() =>
                isAddingChild ? resetChildForm() : setIsAddingChild(true)
              }
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition"
            >
              {isAddingChild ? "Batal" : "+ Tambah Anak"}
            </button>
          </div>

          {isAddingChild && (
            <div className="mb-8 p-6 bg-blue-50/50 rounded-xl border border-blue-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 flex flex-col">
                <label className={labelClass}>Nama Lengkap Anak</label>
                <input
                  type="text"
                  className={inputClass}
                  value={newChild.nama_anak}
                  onChange={(e) =>
                    setNewChild({ ...newChild, nama_anak: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>NIK Anak</label>
                <input
                  type="text"
                  className={inputClass}
                  value={newChild.no_ktp_anak}
                  onChange={(e) =>
                    setNewChild({ ...newChild, no_ktp_anak: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Tempat Lahir</label>
                <input
                  type="text"
                  className={inputClass}
                  value={newChild.tempat_lahir}
                  onChange={(e) =>
                    setNewChild({ ...newChild, tempat_lahir: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Tanggal Lahir</label>
                <input
                  type="date"
                  className={inputClass}
                  value={newChild.tanggal_lahir}
                  onChange={(e) =>
                    setNewChild({ ...newChild, tanggal_lahir: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Jenis Kelamin</label>
                <select
                  className={inputClass}
                  value={newChild.jenis_kelamin}
                  onChange={(e) =>
                    setNewChild({ ...newChild, jenis_kelamin: e.target.value })
                  }
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleSaveChild}
                  className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  {editingChildId ? "Update Data" : "Simpan Anak"}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-gray-600 uppercase">
                    Nama Anak
                  </th>
                  <th className="px-6 py-3 text-left font-bold text-gray-600 uppercase">
                    NIK / KIA
                  </th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {childrenList.map((child) => (
                  <tr key={child.id}>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {child.nama_anak}
                    </td>
                    <td className="px-6 py-4">{child.no_ktp_anak || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditChild(child)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            confirm("Hapus?") &&
                            supabase
                              .from("master_anak")
                              .delete()
                              .eq("id", child.id)
                              .then(() =>
                                setChildrenList(
                                  childrenList.filter((c) => c.id !== child.id)
                                )
                              )
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 6: REKENING PAYROLL */}
        <section>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Rekening Payroll
            </h2>
            <p className="text-sm text-gray-500">
              Untuk keperluan penyaluran gaji.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Nama Bank</label>
              <input
                type="text"
                name="bank"
                value={personalData.bank || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nomor Rekening</label>
              <input
                type="text"
                name="nomor_bank"
                value={personalData.nomor_bank || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Atas Nama</label>
              <input
                type="text"
                name="nama_akun"
                value={personalData.nama_akun || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* FOOTER ACTION */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm py-4 border-t border-gray-100 -mx-8 px-8 flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {updating ? "Memproses..." : "Simpan Seluruh Data Profil"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserDashboard;
