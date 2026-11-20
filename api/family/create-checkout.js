const { bearer, config, db, linkedStudent, parentForToken, crypto } = require('../../lib/family-payment');

const PLANS = {
  monthly: { amount: 39000, label: 'Metiq Plus Bulanan', duration: '1 bulan' },
  annual: { amount: 399000, label: 'Metiq Plus Tahunan', duration: '1 tahun' },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metode tidak didukung.' });
  try {
    const parent = await parentForToken(bearer(req));
    if (!parent) return res.status(401).json({ error: 'Masuk ke akun orang tua dulu.' });
    const plan = PLANS[req.body && req.body.plan];
    if (!plan) return res.status(400).json({ error: 'Paket tidak dikenal.' });
    const studentId = String(req.body && req.body.studentId || '');
    if (!await linkedStudent(parent.id, studentId)) return res.status(403).json({ error: 'Pilih anak yang sudah tertaut ke akun orang tua ini.' });
    const mid = config();
    if (!mid.serverKey || !mid.clientKey) return res.status(503).json({ error: 'Pembayaran Metiq Plus sedang disiapkan. Silakan coba lagi nanti.' });

    const orderId = `METIQ-${crypto.randomUUID()}`;
    await db('family_orders', 'POST', { order_id: orderId, parent_id: parent.id, student_id: studentId, plan: req.body.plan, gross_amount: plan.amount, status: 'pending' });
    const auth = Buffer.from(`${mid.serverKey}:`).toString('base64');
    const response = await fetch(`${mid.snapBase}/snap/v1/transactions`, {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        transaction_details: { order_id: orderId, gross_amount: plan.amount },
        item_details: [{ id: req.body.plan, price: plan.amount, quantity: 1, name: plan.label }],
        customer_details: { first_name: parent.name, email: parent.email },
        callbacks: { finish: 'https://metiqmath.com/#/harga' },
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.token) {
      await db(`family_orders?order_id=eq.${encodeURIComponent(orderId)}`, 'PATCH', { status: 'failed' });
      return res.status(502).json({ error: 'Midtrans belum dapat membuat transaksi. Coba lagi nanti.' });
    }
    await db(`family_orders?order_id=eq.${encodeURIComponent(orderId)}`, 'PATCH', { snap_token: data.token });
    return res.status(200).json({ token: data.token, clientKey: mid.clientKey, production: mid.production, orderId });
  } catch (e) {
    return res.status(503).json({ error: 'Pembayaran belum siap. Periksa konfigurasi server dan migrasi paket keluarga.' });
  }
};
