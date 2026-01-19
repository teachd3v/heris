import { useState, useEffect } from "react";
import Input from "../Input";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

const SectionIdentity = ({ data, onChange, setPersonalData }) => {
  const [uploading, setUploading] = useState(false);

  // --- STATE: Data Wilayah (API) ---
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  // --- STATE: Logika Tambah SIM ---
  const [isAddingSim, setIsAddingSim] = useState(false);
  const [tempSimType, setTempSimType] = useState("");
  const [tempSimNumber, setTempSimNumber] = useState("");

  // --- HELPER 1: Title Case (Tampilan "Jawa Barat") ---
  const toTitleCase = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
  };

  // --- HELPER 2: Sort Array A-Z ---
  const sortByName = (arr) => {
    return arr.sort((a, b) => a.name.localeCompare(b.name));
  };

  // --- 1. LOGIC UPLOAD FOTO ---
  const handleUploadAvatar = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Pilih gambar terlebih dahulu.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();

      // SANITIZE: Pastikan nama file bersih + Timestamp
      const cleanKtp = (data.no_ktp || "user").replace(/[^a-zA-Z0-9]/g, "");
      const fileName = `${cleanKtp}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload ke bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Dapatkan URL Public
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update State Lokal
      setPersonalData((prev) => ({ ...prev, foto_profil: urlData.publicUrl }));
      toast.success("Foto berhasil diunggah!");
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Gagal upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 2. LOGIC WILAYAH (API INDONESIA) ---

  // Fetch Provinsi saat mount
  useEffect(() => {
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json`)
      .then((res) => res.json())
      .then((res) => setProvinces(sortByName(res)));
  }, []);

  // Handler Ganti Provinsi -> Fetch Kota
  const handleProvinceChange = (e) => {
    const selectedName = e.target.options[e.target.selectedIndex].text;
    const selectedId = e.target.value;

    setPersonalData((prev) => ({
      ...prev,
      provinsi: selectedName,
      kabupaten_kota: "",
      kecamatan: "",
      desa_kelurahan: "",
    }));

    fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedId}.json`,
    )
      .then((res) => res.json())
      .then((res) => setRegencies(sortByName(res)));
  };

  // Handler Ganti Kota -> Fetch Kecamatan
  const handleRegencyChange = (e) => {
    const selectedName = e.target.options[e.target.selectedIndex].text;
    const selectedId = e.target.value;

    setPersonalData((prev) => ({
      ...prev,
      kabupaten_kota: selectedName,
      kecamatan: "",
      desa_kelurahan: "",
    }));

    fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedId}.json`,
    )
      .then((res) => res.json())
      .then((res) => setDistricts(sortByName(res)));
  };

  // Handler Ganti Kecamatan -> Fetch Desa
  const handleDistrictChange = (e) => {
    const selectedName = e.target.options[e.target.selectedIndex].text;
    const selectedId = e.target.value;

    setPersonalData((prev) => ({
      ...prev,
      kecamatan: selectedName,
      desa_kelurahan: "",
    }));

    fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedId}.json`,
    )
      .then((res) => res.json())
      .then((res) => setVillages(sortByName(res)));
  };

  // Handler Ganti Desa
  const handleVillageChange = (e) => {
    const selectedName = e.target.options[e.target.selectedIndex].text;
    setPersonalData((prev) => ({ ...prev, desa_kelurahan: selectedName }));
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
        <h2 className="text-xl font-bold text-gray-900">Identitas Pribadi</h2>
      </div>

      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* --- KOLOM KIRI: FOTO PROFIL --- */}
        <div className="md:col-span-1 flex flex-col items-center gap-4">
          <div className="relative w-40 h-40 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow-md group">
            {data.foto_profil ? (
              <img
                src={data.foto_profil}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-4xl font-bold">
                ?
              </div>
            )}
            {/* Overlay Upload */}
            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold text-center p-2">
              {uploading ? "Mengupload..." : "Ganti Foto"}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadAvatar}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Format: JPG/PNG, Max 2MB
          </p>
        </div>

        {/* --- KOLOM KANAN: FORM IDENTITAS --- */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nama Lengkap"
            name="nama_lengkap"
            value={data.nama_lengkap}
            onChange={onChange}
          />
          <Input
            label="NIK (KTP)"
            value={data.no_ktp}
            disabled
            bg="bg-gray-100"
          />

          <Input
            label="Tempat Lahir"
            name="tempat_lahir"
            value={data.tempat_lahir}
            onChange={onChange}
          />
          <Input
            label="Tanggal Lahir"
            type="date"
            name="tanggal_lahir"
            value={data.tanggal_lahir}
            onChange={onChange}
          />

          <Input
            label="Jenis Kelamin"
            type="select"
            name="jenis_kelamin"
            options={["Laki-Laki", "Perempuan"]}
            value={data.jenis_kelamin}
            onChange={onChange}
          />
          <Input
            label="Golongan Darah"
            name="golongan_darah"
            value={data.golongan_darah}
            onChange={onChange}
            placeholder="Contoh: O"
          />

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Pribadi"
              type="email"
              name="email_pribadi"
              value={data.email_pribadi}
              onChange={onChange}
            />
            <Input
              label="Nomor WhatsApp"
              name="kontak"
              value={data.kontak}
              onChange={onChange}
            />
          </div>

          {/* --- SECTION ALAMAT (CASCADING + TITLE CASE) --- */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
            <h3 className="font-bold text-gray-700 mb-4">Alamat Domisili</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Provinsi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">
                  Provinsi
                </label>
                <select
                  className="p-3 border rounded-xl bg-white"
                  onChange={handleProvinceChange}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {toTitleCase(data.provinsi) || "-- Pilih Provinsi --"}
                  </option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {toTitleCase(p.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Kabupaten */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">
                  Kabupaten/Kota
                </label>
                <select
                  className="p-3 border rounded-xl bg-white"
                  onChange={handleRegencyChange}
                  disabled={!regencies.length}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {toTitleCase(data.kabupaten_kota) || "-- Pilih Kota --"}
                  </option>
                  {regencies.map((r) => (
                    <option key={r.id} value={r.id}>
                      {toTitleCase(r.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Kecamatan */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">
                  Kecamatan
                </label>
                <select
                  className="p-3 border rounded-xl bg-white"
                  onChange={handleDistrictChange}
                  disabled={!districts.length}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {toTitleCase(data.kecamatan) || "-- Pilih Kecamatan --"}
                  </option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {toTitleCase(d.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Desa */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">
                  Desa/Kelurahan
                </label>
                <select
                  className="p-3 border rounded-xl bg-white"
                  onChange={handleVillageChange}
                  disabled={!villages.length}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {toTitleCase(data.desa_kelurahan) || "-- Pilih Desa --"}
                  </option>
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {toTitleCase(v.name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Input
                label="Alamat Detail (Jalan, RT/RW, No. Rumah)"
                type="textarea"
                name="alamat_domisili"
                value={data.alamat_domisili}
                onChange={onChange}
              />
            </div>
          </div>

          {/* --- SECTION SIM (DYNAMIC UI) --- */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
            <h3 className="font-bold text-gray-700 mb-4">
              Informasi Mengemudi
            </h3>

            <div className="space-y-3">
              {/* LIST SIM YANG SUDAH ADA */}
              {[
                { key: "sim_a", label: "SIM A" },
                { key: "sim_b", label: "SIM B" },
                { key: "sim_c", label: "SIM C" },
              ].map((sim) => {
                if (!data[sim.key]) return null;
                return (
                  <div
                    key={sim.key}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {sim.label}
                      </div>
                      <span className="font-mono font-semibold text-gray-700">
                        {data[sim.key]}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPersonalData((prev) => ({ ...prev, [sim.key]: "" }))
                      }
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                );
              })}

              {/* FORM TAMBAH SIM BARU */}
              {(() => {
                const availableOptions = [
                  { key: "sim_a", label: "SIM A" },
                  { key: "sim_b", label: "SIM B" },
                  { key: "sim_c", label: "SIM C" },
                ].filter((opt) => !data[opt.key]);

                if (availableOptions.length === 0) return null;

                return (
                  <div className="mt-2">
                    {!isAddingSim ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSim(true);
                          setTempSimType(availableOptions[0].key);
                          setTempSimNumber("");
                        }}
                        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 px-4 py-2 rounded-lg border border-dashed border-blue-300 transition-all w-full md:w-auto"
                      >
                        <span>+ Tambah Informasi SIM</span>
                      </button>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl animate-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <select
                            className="p-3 border rounded-xl bg-white font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={tempSimType}
                            onChange={(e) => setTempSimType(e.target.value)}
                          >
                            {availableOptions.map((opt) => (
                              <option key={opt.key} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            placeholder="Masukkan Nomor SIM..."
                            className="md:col-span-2 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={tempSimNumber}
                            onChange={(e) => setTempSimNumber(e.target.value)}
                            autoFocus
                          />
                        </div>

                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => setIsAddingSim(false)}
                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            disabled={!tempSimNumber}
                            onClick={() => {
                              if (tempSimNumber) {
                                setPersonalData((prev) => ({
                                  ...prev,
                                  [tempSimType]: tempSimNumber,
                                }));
                                setIsAddingSim(false);
                                toast.success("SIM ditambahkan ke draft");
                              }
                            }}
                            className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            Simpan SIM
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionIdentity;
