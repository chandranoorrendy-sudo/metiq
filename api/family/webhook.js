const { config, db, crypto } = require('../../lib/family-payment');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metode tidak didukung.' });
  try {
    const mid = config(), body = req.body || {};
    if (!mid.serverKey || !body.order_id || !body.signature_key || !body.status_code || !body.gross_amount) return res.status(400).json({ error: 'Notifikasi tidak lengkap.' });
    const expected = crypto.createHash('sha512').update(`${body.order_id}${body.status_code}${body.gross_amount}${mid.serverKey}`).digest('hex');
    const a = Buffer.from(expected), b = Buffer.from(String(body.signature_key));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'Tanda tangan notifikasi tidak valid.' });

    // Confirm the final state and amount directly with Midtrans before granting access.
    const auth = Buffer.from(`${mid.serverKey}:`).toString('base64');
    const check = await fetch(`${mid.apiBase}/v2/${encodeURIComponent(body.order_id)}/status`, { headers: { Accept: 'application/json', Authorization: `Basic ${auth}` } });
    if (!check.ok) return res.status(502).json({ error: 'Status Midtrans belum dapat diverifikasi.' });
    const tx = await check.json();
    const orders = await db(`family_orders?select=order_id,gross_amount&order_id=eq.${encodeURIComponent(body.order_id)}&limit=1`);
    const order = orders && orders[0];
    if (!order || Number(tx.gross_amount) !== Number(order.gross_amount) || tx.order_id !== order.order_id) return res.status(400).json({ error: 'Data transaksi tidak cocok.' });
    let status = 'pending';
    if (tx.transaction_status === 'settlement' || (tx.transaction_status === 'capture' && (!tx.fraud_status || tx.fraud_status === 'accept'))) status = 'paid';
    else if (['deny', 'cancel'].includes(tx.transaction_status)) status = 'failed';
    else if (tx.transaction_status === 'expire') status = 'expired';
    await db('rpc/family_apply_payment', 'POST', { p_order_id: order.order_id, p_status: status, p_transaction_id: tx.transaction_id || null });
    return res.status(200).json({ received: true });
  } catch (e) { return res.status(503).json({ error: 'Notifikasi pembayaran belum dapat diproses.' }); }
};
