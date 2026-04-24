/**
 * Helper untuk upload file ke Cloudinary menggunakan Unsigned Upload
 */
export const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary credentials belum di-set di .env");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gagal upload ke Cloudinary");
    }

    const data = await response.json();
    return data.secure_url; // Mengembalikan URL foto yang sudah jadi
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
