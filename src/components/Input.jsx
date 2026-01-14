const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  required = false,
  options = [],
  rows = 3,
}) => {
  const baseClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-gray-300";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {type === "select" ? (
        <div className="relative">
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            className={`${baseClass} appearance-none cursor-pointer`}
          >
            <option value="">-- Pilih {label} --</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          rows={rows}
          placeholder={placeholder}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
};

export default Input;
