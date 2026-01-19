import Input from "../Input";

const SectionFamily = ({ data, onChange }) => {
  // Logic: Form Pasangan hanya muncul jika status "Menikah"
  const showSpouseForm = data.status_pernikahan === "Menikah";

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-6">Data Pasangan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Pernikahan Selalu Muncul */}
        <div className="md:col-span-2">
          <Input
            label="Status Pernikahan"
            type="select"
            name="status_pernikahan"
            options={["Belum Menikah", "Menikah", "Cerai Hidup", "Cerai Mati"]}
            value={data.status_pernikahan}
            onChange={onChange}
          />
        </div>

        {/* Form Pasangan (Conditional Rendering) */}
        {showSpouseForm && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
            <Input
              label="Tanggal Pernikahan"
              type="date"
              name="tanggal_pernikahan"
              value={data.tanggal_pernikahan}
              onChange={onChange}
            />
            <Input
              label="Nama Pasangan (Suami/Istri)"
              name="nama_pasangan"
              value={data.nama_pasangan}
              onChange={onChange}
            />
            <div className="md:col-span-2">
              <Input
                label="Kontak Pasangan"
                name="kontak_pasangan"
                value={data.kontak_pasangan}
                onChange={onChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SectionFamily;
