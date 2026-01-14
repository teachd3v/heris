import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import Input from "./Input";

const UserDashboard = ({ currentUser }) => {
  // --- STATE MANAGEMENT ---
  const [personalData, setPersonalData] = useState({});
  const [childrenList, setChildrenList] = useState([]);

  // State Data Anak
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);

  // State Form Anak (Update status_kegiatan default)
  const [newChild, setNewChild] = useState({
    nama_anak: "",
    no_ktp_anak: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "Laki-laki",
    status_kegiatan: "Belum Sekolah", // Default
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const childFormRef = useRef(null);

  // List Opsi Status Kegiatan Lengkap
  const statusKegiatanOptions = [
    "Belum Sekolah",
    "PAUD",
    "TK",
    "SD",
    "SMP",
    "SMA/SMK",
    "D1",
    "D2",
    "D3",
    "D4",
    "S1",
    "S2",
    "S3",
    "Bekerja",
    "Tidak Bekerja",
  ];

  // --- FETCH DATA ---
  useEffect(() => {
    if (currentUser?.nik) fetchMyData();
  }, [currentUser]);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("master_pekerjaan")
        .select(`no_ktp, master_personal:no_ktp ( *, master_anak (*) )`)
        .eq("nik", currentUser.nik)
        .single();

      if (error) throw error;

      if (data?.master_personal) {
        setPersonalData(data.master_personal);
        const sortedChildren = (data.master_personal.master_anak || []).sort(
          (a, b) => new Date(a.tanggal_lahir) - new Date(b.tanggal_lahir)
        );
        setChildrenList(sortedChildren);
      }
    } catch (error) {
      toast.error("Gagal memuat data profil.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    setPersonalData({ ...personalData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const { master_anak, ...cleanData } = personalData;

    try {
      const { error } = await supabase
        .from("master_personal")
        .update(cleanData)
        .eq("no_ktp", personalData.no_ktp);

      if (error) throw error;
      toast.success("Data profil utama berhasil disimpan!");
    } catch (error) {
      toast.error("Gagal menyimpan: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  // --- HANDLERS ANAK ---
  const handleChildChange = (e) => {
    setNewChild({ ...newChild, [e.target.name]: e.target.value });
  };

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

  const handleSaveChild = async () => {
    if (!newChild.nama_anak || !newChild.tanggal_lahir)
      return toast.warning("Nama dan Tanggal Lahir anak wajib diisi!");

    setUpdating(true);
    try {
      if (editingChildId) {
        const { error } = await supabase
          .from("master_anak")
          .update(newChild)
          .eq("id", editingChildId);
        if (error) throw error;
        toast.success("Data anak diperbarui");
      } else {
        const { error } = await supabase
          .from("master_anak")
          .insert([{ ...newChild, parent_no_ktp: personalData.no_ktp }]);
        if (error) throw error;
        toast.success("Anak berhasil ditambahkan");
      }
      resetChildForm();
      fetchMyData();
    } catch (error) {
      toast.error("Gagal menyimpan data anak: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleEditChild = (child) => {
    setNewChild(child);
    setEditingChildId(child.id);
    setIsAddingChild(true);
    setTimeout(() => {
      childFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const handleDeleteChild = async (id) => {
    if (!confirm("Hapus data anak ini?")) return;
    try {
      await supabase.from("master_anak").delete().eq("id", id);
      toast.success("Data anak dihapus");
      setChildrenList(childrenList.filter((c) => c.id !== id));
    } catch (error) {
      toast.error("Gagal menghapus anak");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full"></div>
        <p className="text-gray-400 font-medium animate-pulse">
          Memuat Data Karyawan...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-8 pb-32 px-4 md:px-8 bg-white shadow-xl rounded-[2rem] border border-gray-100 my-8">
      {/* HEADER PAGE */}
      <div className="mb-10 text-center md:text-left border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Formulir Data Karyawan
        </h1>
        <p className="text-slate-500 mt-2">
          Pastikan seluruh data, terutama data keluarga, terisi dengan benar.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-12">
        {/* SECTION 1: IDENTITAS PRIBADI */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
            <h2 className="text-xl font-bold text-gray-900">
              Identitas Pribadi
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="md:col-span-2">
              <Input
                label="Nama Lengkap"
                name="nama_lengkap"
                value={personalData.nama_lengkap}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="NIK (Terkunci)"
                value={personalData.no_ktp}
                disabled
              />
            </div>
            <Input
              label="Tempat Lahir"
              name="tempat_lahir"
              value={personalData.tempat_lahir}
              onChange={handleChange}
            />
            <Input
              label="Tanggal Lahir"
              type="date"
              name="tanggal_lahir"
              value={personalData.tanggal_lahir}
              onChange={handleChange}
            />
            <Input
              label="Jenis Kelamin"
              type="select"
              name="jenis_kelamin"
              options={["Laki-Laki", "Perempuan"]}
              value={personalData.jenis_kelamin}
              onChange={handleChange}
            />
            <Input
              label="Golongan Darah"
              name="golongan_darah"
              value={personalData.golongan_darah}
              onChange={handleChange}
              placeholder="A/B/O/AB"
            />
            <div className="md:col-span-2">
              <Input
                label="Email Pribadi"
                type="email"
                name="email_pribadi"
                value={personalData.email_pribadi}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Nomor WhatsApp"
                name="kontak"
                value={personalData.kontak}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-4">
              <Input
                label="Alamat Domisili"
                type="textarea"
                name="alamat_domisili"
                value={personalData.alamat_domisili}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: RIWAYAT PENDIDIKAN */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-8 bg-purple-600 rounded-full"></span>
            <h2 className="text-xl font-bold text-gray-900">
              Riwayat Pendidikan
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <Input
              label="Tingkat Pendidikan"
              type="select"
              name="tingkat_pendidikan_terakhir"
              options={["SMA", "D3", "D4", "S1", "S2", "S3"]}
              value={personalData.tingkat_pendidikan_terakhir}
              onChange={handleChange}
            />
            <Input
              label="Institusi / Universitas"
              name="institusi_pendidikan"
              value={personalData.institusi_pendidikan}
              onChange={handleChange}
            />
            <Input
              label="Jurusan / Prodi"
              name="jurusan_pendidikan"
              value={personalData.jurusan_pendidikan}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* SECTION 3: KELUARGA & PASANGAN */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-8 bg-pink-500 rounded-full"></span>
            <h2 className="text-xl font-bold text-gray-900">
              Keluarga & Pasangan
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <Input
              label="Status Pernikahan"
              type="select"
              name="status_pernikahan"
              options={[
                "Belum Menikah",
                "Menikah",
                "Cerai Hidup",
                "Cerai Mati",
              ]}
              value={personalData.status_pernikahan}
              onChange={handleChange}
            />
            <Input
              label="Tanggal Pernikahan"
              type="date"
              name="tanggal_pernikahan"
              value={personalData.tanggal_pernikahan}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <Input
                label="Nama Pasangan"
                name="nama_pasangan"
                value={personalData.nama_pasangan}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Kontak Pasangan"
                name="kontak_pasangan"
                value={personalData.kontak_pasangan}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2 hidden md:block"></div>
            <div className="md:col-span-4 border-t border-gray-200 my-2"></div>
            <Input
              label="Nama Kontak Keluarga"
              name="nama_kontak_keluarga"
              value={personalData.nama_kontak_keluarga}
              onChange={handleChange}
              placeholder="Orang tua / Saudara"
            />
            <Input
              label="Hubungan"
              name="hubungan_keluarga"
              value={personalData.hubungan_keluarga}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <Input
                label="Nomor Kontak Keluarga"
                name="kontak_keluarga"
                value={personalData.kontak_keluarga}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: DATA SIM */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-8 bg-orange-500 rounded-full"></span>
            <h2 className="text-xl font-bold text-gray-900">Data SIM</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <Input
              label="Nomor SIM A"
              name="sim_a"
              value={personalData.sim_a}
              onChange={handleChange}
            />
            <Input
              label="Nomor SIM B"
              name="sim_b"
              value={personalData.sim_b}
              onChange={handleChange}
            />
            <Input
              label="Nomor SIM C"
              name="sim_c"
              value={personalData.sim_c}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* SECTION 5: DATA ANAK (CRUD + STATUS KEGIATAN) */}
        <section id="section-anak">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-8 bg-teal-500 rounded-full"></span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Data Anak</h2>
                <p className="text-sm text-gray-500">
                  Wajib diisi untuk keperluan tunjangan.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                isAddingChild ? resetChildForm() : setIsAddingChild(true)
              }
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                isAddingChild
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isAddingChild ? "Batal Input" : "+ Tambah Anak"}
            </button>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            {isAddingChild && (
              <div
                ref={childFormRef}
                className="mb-8 p-6 bg-white rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-2"
              >
                <p className="text-xs font-black text-blue-600 uppercase mb-4 tracking-wider">
                  {editingChildId ? "Edit Data Anak" : "Input Anak Baru"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Nama Lengkap Anak"
                      name="nama_anak"
                      value={newChild.nama_anak}
                      onChange={handleChildChange}
                      required
                    />
                  </div>
                  <Input
                    label="NIK / KIA Anak"
                    name="no_ktp_anak"
                    value={newChild.no_ktp_anak}
                    onChange={handleChildChange}
                  />
                  <Input
                    label="Tempat Lahir"
                    name="tempat_lahir"
                    value={newChild.tempat_lahir}
                    onChange={handleChildChange}
                  />
                  <Input
                    label="Tanggal Lahir"
                    type="date"
                    name="tanggal_lahir"
                    value={newChild.tanggal_lahir}
                    onChange={handleChildChange}
                    required
                  />
                  <Input
                    label="Jenis Kelamin"
                    type="select"
                    name="jenis_kelamin"
                    options={["Laki-laki", "Perempuan"]}
                    value={newChild.jenis_kelamin}
                    onChange={handleChildChange}
                  />

                  {/* --- BAGIAN BARU: STATUS KEGIATAN --- */}
                  <Input
                    label="Status Kegiatan / Pendidikan"
                    type="select"
                    name="status_kegiatan"
                    options={statusKegiatanOptions}
                    value={newChild.status_kegiatan}
                    onChange={handleChildChange}
                  />

                  <div className="md:col-span-3 flex justify-end mt-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleSaveChild}
                      disabled={updating}
                      className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-50"
                    >
                      {updating
                        ? "Menyimpan..."
                        : editingChildId
                        ? "Simpan Perubahan"
                        : "Tambahkan ke Tabel"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TABEL LIST ANAK */}
            <div className="overflow-hidden bg-white rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Nama Anak
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Detail Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {childrenList.length > 0 ? (
                    childrenList.map((child) => (
                      <tr
                        key={child.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {child.nama_anak}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          NIK: {child.no_ktp_anak || "-"}
                          <br />
                          <span className="text-xs text-gray-400">
                            {child.jenis_kelamin}, {child.tanggal_lahir}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {child.status_kegiatan || "Belum Sekolah"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditChild(child)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteChild(child.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-8 text-center text-gray-400 italic"
                      >
                        Belum ada data anak.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 6: REKENING PAYROLL */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-8 bg-green-600 rounded-full"></span>
            <h2 className="text-xl font-bold text-gray-900">
              Rekening Payroll
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <Input
              label="Nama Bank"
              name="bank"
              value={personalData.bank}
              onChange={handleChange}
            />
            <Input
              label="Nomor Rekening"
              name="nomor_bank"
              value={personalData.nomor_bank}
              onChange={handleChange}
            />
            <Input
              label="Atas Nama Rekening"
              name="nama_akun"
              value={personalData.nama_akun}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* FLOATING ACTION BUTTON */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="submit"
            disabled={updating}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-2xl hover:bg-black hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 border-4 border-white"
          >
            {updating ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Menyimpan...
              </>
            ) : (
              "SIMPAN SELURUH DATA"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserDashboard;
