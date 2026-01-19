import Input from "../Input";

const SectionEducation = ({ data, onChange }) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-8 bg-purple-600 rounded-full"></span>
        <h2 className="text-xl font-bold text-gray-900">Pendidikan Terakhir</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-200">
        <Input
          label="Tingkat Pendidikan"
          type="select"
          name="tingkat_pendidikan_terakhir"
          options={["SMA/SMK", "D3", "D4", "S1", "S2", "S3"]}
          value={data.tingkat_pendidikan_terakhir}
          onChange={onChange}
        />
        <Input
          label="Institusi / Universitas"
          name="institusi_pendidikan"
          value={data.institusi_pendidikan}
          onChange={onChange}
        />
        <Input
          label="Jurusan / Prodi"
          name="jurusan_pendidikan"
          value={data.jurusan_pendidikan}
          onChange={onChange}
        />
      </div>
    </section>
  );
};
export default SectionEducation;
