/* Isi dengan URL proyek Supabase dan publishable key (aman untuk browser).
 * Jika dikosongkan, Metiq berjalan dalam mode lokal (data hanya di perangkat ini). */
window.METIQ_CONFIG = {
  supabaseUrl: 'https://cemrfgwhixxbxhwdpred.supabase.co',
  supabaseKey: 'sb_publishable_Wp1oxytM0fWDtbSWoh06Pg_3-GNL6Pu',
  // Client ID OAuth Google (bukan rahasia) untuk tombol "Masuk dengan Google" orang tua (SQL 027 dan 028).
  googleClientId: '174789841971-095c49bv0rt2jl3k50rs3ds45a8gdui4.apps.googleusercontent.com',
  // Bintang dihitung di server (butuh supabase/014_bintang_server.sql).
  // Nyalakan hanya setelah migrasi itu dijalankan di Supabase.
  starsServer: false,
};
