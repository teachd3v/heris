import { neon } from "@neondatabase/serverless";

const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL);

/**
 * Helper untuk query ke Neon
 * Contoh penggunaan: 
 * const users = await db`SELECT * FROM master_users WHERE nik = ${nik}`;
 */
export const db = async (strings, ...values) => {
  try {
    const result = await sql(strings, ...values);
    return result;
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
};
