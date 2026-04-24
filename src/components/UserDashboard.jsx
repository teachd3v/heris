import { useEffect, useState } from "react";
import { db } from "../lib/db";
import { toast } from "sonner";
import SectionIdentity from "./dashboard/SectionIdentity";
import SectionEducation from "./dashboard/SectionEducation";
import SectionFamily from "./dashboard/SectionFamily";
import SectionChildren from "./dashboard/SectionChildren";
import SectionEmergency from "./dashboard/SectionEmergency";

const UserDashboard = ({ currentUser }) => {
  const [personalData, setPersonalData] = useState({});
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    if (currentUser?.nik) fetchMyData();
  }, [currentUser]);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      // Ambil data personal + anak (Pakai SQL Join agar efisien)
      const results = await db`
        SELECT 
          p.*,
          (
            SELECT json_agg(a.*) 
            FROM master_anak a 
            WHERE a.no_ktp_ortu = p.no_ktp
          ) as master_anak
        FROM master_pekerjaan pk
        JOIN master_personal p ON pk.no_ktp = p.no_ktp
        WHERE pk.nik = ${currentUser.nik}
        LIMIT 1
      `;

      const data = results[0];

      if (data) {
        setPersonalData(data);

        // Sortir anak berdasarkan tanggal lahir
        const sortedChildren = (data.master_anak || []).sort(
          (a, b) => new Date(a.tanggal_lahir) - new Date(b.tanggal_lahir),
        );
        setChildrenList(sortedChildren);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data profil.");
    } finally {
      setLoading(false);
    }
  };

  // --- GLOBAL HANDLER (Untuk Input Biasa) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({ ...prev, [name]: value }));
  };

  // --- SAVE HANDLER (Parent Save + Auto Refresh) ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    // Pisahkan data anak dari object personalData agar tidak error saat update
    const { master_anak, created_at, ...cleanData } = personalData;

    try {
      // Update di Neon pakai SQL
      await db`
        UPDATE master_personal 
        SET 
          nama_lengkap = ${cleanData.nama_lengkap},
          tempat_lahir = ${cleanData.tempat_lahir},
          tanggal_lahir = ${cleanData.tanggal_lahir},
          jenis_kelamin = ${cleanData.jenis_kelamin},
          golongan_darah = ${cleanData.golongan_darah},
          email_pribadi = ${cleanData.email_pribadi},
          kontak = ${cleanData.kontak},
          provinsi = ${cleanData.provinsi},
          kabupaten_kota = ${cleanData.kabupaten_kota},
          kecamatan = ${cleanData.kecamatan},
          desa_kelurahan = ${cleanData.desa_kelurahan},
          alamat_domisili = ${cleanData.alamat_domisili},
          foto_profil = ${cleanData.foto_profil},
          sim_a = ${cleanData.sim_a},
          sim_b = ${cleanData.sim_b},
          sim_c = ${cleanData.sim_c}
        WHERE no_ktp = ${cleanData.no_ktp}
      `;

      toast.success("Data berhasil disimpan! Memuat ulang...");

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Gagal menyimpan: " + error.message);
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full"></div>
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
          Lengkapi data di bawah ini untuk keperluan administrasi HR.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-10">
        {/* 1. IDENTITAS (Termasuk Foto & Alamat) */}
        <SectionIdentity
          data={personalData}
          onChange={handleChange}
          setPersonalData={setPersonalData} // Butuh ini untuk update Foto & Dropdown Alamat
        />

        {/* 2. PENDIDIKAN */}
        <SectionEducation data={personalData} onChange={handleChange} />

        {/* WRAPPER KELUARGA (Pasangan & Anak) */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-pink-50 p-6 border-b border-pink-100">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
              <h2 className="text-xl font-bold text-gray-900">Data Keluarga</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Informasi pasangan dan anak (untuk tunjangan).
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-12">
            {/* 3. PASANGAN (Logic Input ada di dalam component) */}
            <SectionFamily data={personalData} onChange={handleChange} />

            {/* LOGIC ANAK: 
                Tampilkan Section Anak JIKA status BUKAN "Belum Menikah".
                (Artinya: Menikah, Cerai Hidup, Cerai Mati -> Anak Muncul)
             */}
            {personalData.status_pernikahan !== "Belum Menikah" && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="border-t border-gray-100 mb-8"></div>

                {/* 5. ANAK */}
                <SectionChildren
                  childrenList={childrenList}
                  parentKtp={personalData.no_ktp}
                  onRefresh={fetchMyData}
                />
              </div>
            )}
          </div>
        </div>

        {/* 4. KONTAK DARURAT */}
        <SectionEmergency data={personalData} onChange={handleChange} />

        {/* FLOATING SAVE BUTTON */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="submit"
            disabled={updating}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-2xl hover:bg-black hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 border-4 border-white"
          >
            {updating ? "Menyimpan..." : "SIMPAN PERUBAHAN"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserDashboard;
