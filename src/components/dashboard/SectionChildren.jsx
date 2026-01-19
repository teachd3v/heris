import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import Input from "../Input";

const SectionChildren = ({ childrenList, parentKtp, onRefresh }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Default Value Form Anak
  const initialForm = {
    nama_anak: "",
    no_ktp_anak: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "Laki-laki",
    status_kegiatan: "Belum Sekolah",
  };
  const [formData, setFormData] = useState(initialForm);

  const statusOptions = [
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
    "Bekerja",
    "Tidak Bekerja",
  ];

  // Handler Input Form
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Mode Tambah Baru
  const handleAddNew = () => {
    setFormData(initialForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  // Mode Edit
  const handleEdit = (child) => {
    setFormData(child);
    setEditingId(child.id);
    setIsFormOpen(true);
  };

  // Cancel
  const handleCancel = () => {
    setIsFormOpen(false);
    setFormData(initialForm);
  };

  // --- SAVE TO DATABASE ---
  const handleSave = async () => {
    if (!formData.nama_anak || !formData.tanggal_lahir)
      return toast.warning("Nama dan Tanggal Lahir wajib diisi");

    setLoading(true);
    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from("master_anak")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Data anak diperbarui");
      } else {
        // Insert Baru
        const { error } = await supabase
          .from("master_anak")
          .insert([{ ...formData, parent_no_ktp: parentKtp }]);
        if (error) throw error;
        toast.success("Anak berhasil ditambahkan");
      }

      handleCancel(); // Tutup form
      onRefresh(); // Minta parent refresh data
    } catch (error) {
      toast.error("Gagal menyimpan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus data anak ini?")) return;
    try {
      await supabase.from("master_anak").delete().eq("id", id);
      toast.success("Dihapus");
      onRefresh();
    } catch (e) {
      toast.error("Gagal hapus");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Data Anak</h3>
        {!isFormOpen && (
          <button
            onClick={handleAddNew}
            type="button"
            className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-100"
          >
            + Tambah Anak
          </button>
        )}
      </div>

      {/* --- FORM AREA --- */}
      {isFormOpen && (
        <div className="bg-slate-50 border border-blue-200 p-6 rounded-2xl mb-6 animate-in fade-in slide-in-from-top-2">
          <h4 className="font-bold text-blue-800 mb-4">
            {editingId ? "Edit Data Anak" : "Input Anak Baru"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nama Lengkap Anak"
                name="nama_anak"
                value={formData.nama_anak}
                onChange={handleChange}
              />
            </div>
            <Input
              label="NIK / KIA"
              name="no_ktp_anak"
              value={formData.no_ktp_anak}
              onChange={handleChange}
            />
            <Input
              label="Jenis Kelamin"
              type="select"
              name="jenis_kelamin"
              options={["Laki-laki", "Perempuan"]}
              value={formData.jenis_kelamin}
              onChange={handleChange}
            />
            <Input
              label="Tempat Lahir"
              name="tempat_lahir"
              value={formData.tempat_lahir}
              onChange={handleChange}
            />
            <Input
              label="Tanggal Lahir"
              type="date"
              name="tanggal_lahir"
              value={formData.tanggal_lahir}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <Input
                label="Status Kegiatan / Pendidikan"
                type="select"
                name="status_kegiatan"
                options={statusOptions}
                value={formData.status_kegiatan}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={handleCancel}
              type="button"
              className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              type="button"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </div>
      )}

      {/* --- TABLE AREA --- */}
      <div className="overflow-hidden border border-gray-200 rounded-xl">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Nama Anak
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Detail
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {childrenList.length > 0 ? (
              childrenList.map((child) => (
                <tr key={child.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-gray-700">
                    {child.nama_anak}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {child.jenis_kelamin}, {child.tanggal_lahir} <br />
                    <span className="text-xs text-gray-400">
                      NIK: {child.no_ktp_anak || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-md">
                      {child.status_kegiatan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(child)}
                      type="button"
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(child.id)}
                      type="button"
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-400 text-sm"
                >
                  Belum ada data anak.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default SectionChildren;
