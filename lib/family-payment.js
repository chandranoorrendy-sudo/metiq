const crypto = require('node:crypto');

const env = () => {
  const url = process.env.SUPABASE_URL || process.env.METIQ_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Konfigurasi Supabase server belum lengkap.');
  return { url: url.replace(/\/$/, ''), key };
};

async function db(path, method = 'GET', body) {
  const { url, key } = env();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: method === 'POST' ? 'return=representation' : 'return=minimal' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const raw = await response.text();
  let data = null; try { data = raw ? JSON.parse(raw) : null; } catch (e) { data = raw; }
  if (!response.ok) throw new Error(data && data.message ? data.message : 'Permintaan database gagal.');
  return data;
}

function bearer(req) {
  const h = req.headers.authorization || '';
  return /^Bearer\s+([a-f0-9]{48})$/i.exec(h)?.[1] || '';
}

async function parentForToken(token) {
  if (!token) return null;
  const sessions = await db(`parent_sessions?select=parent_id&token=eq.${encodeURIComponent(token)}&limit=1`);
  if (!sessions || !sessions[0]) return null;
  const parents = await db(`parents?select=id,name,email&id=eq.${encodeURIComponent(sessions[0].parent_id)}&limit=1`);
  return parents && parents[0] || null;
}

async function linkedStudent(parentId, studentId) {
  if (!parentId || !studentId) return false;
  const links = await db(`parent_students?select=student_id&parent_id=eq.${encodeURIComponent(parentId)}&student_id=eq.${encodeURIComponent(studentId)}&limit=1`);
  return !!(links && links[0]);
}

const config = () => {
  const production = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || '';
  return {
    production, serverKey, clientKey,
    snapBase: production ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com',
    apiBase: production ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com',
  };
};

module.exports = { bearer, config, db, linkedStudent, parentForToken, crypto };
