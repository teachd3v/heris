import Input from "../Input";

const SectionEmergency = ({ data, onChange }) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-8 bg-red-500 rounded-full"></span>
        <h2 className="text-xl font-bold text-gray-900">Kontak Darurat</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-200">
        <Input
          label="Nama Kontak (Keluarga Dekat)"
          name="nama_kontak_keluarga"
          value={data.nama_kontak_keluarga}
          onChange={onChange}
          placeholder="Ayah / Ibu / Saudara"
        />
        <Input
          label="Hubungan"
          name="hubungan_keluarga"
          value={data.hubungan_keluarga}
          onChange={onChange}
          placeholder="Orang Tua / Kakak"
        />
        <Input
          label="Nomor Telepon"
          name="kontak_keluarga"
          value={data.kontak_keluarga}
          onChange={onChange}
        />
      </div>
    </section>
  );
};
export default SectionEmergency;
