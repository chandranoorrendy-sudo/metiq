/* Isi dengan URL proyek Supabase dan publishable key (aman untuk browser).
 * Jika dikosongkan, Metiq berjalan dalam mode lokal (data hanya di perangkat ini). */
window.METIQ_CONFIG = {
  supabaseUrl: 'https://cemrfgwhixxbxhwdpred.supabase.co',
  supabaseKey: 'sb_publishable_Wp1oxytM0fWDtbSWoh06Pg_3-GNL6Pu',
  // Bintang dihitung di server (butuh supabase/014_bintang_server.sql).
  // Nyalakan hanya setelah migrasi itu dijalankan di Supabase.
  starsServer: false,
};
