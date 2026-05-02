import { createClient } from '@supabase/supabase-js'

// Mengambil URL dan Anon Key dari file .env (konvensi Vite menggunakan VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Mengecek apakah environment variables sudah diatur
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL atau Anon Key belum diatur di file .env!")
}

// Inisialisasi dan export client supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)