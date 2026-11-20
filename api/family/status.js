const { bearer, db, parentForToken } = require('../../lib/family-payment');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metode tidak didukung.' });
  try {
    const parent = await parentForToken(bearer(req));
    if (!parent) return res.status(401).json({ error: 'Masuk ke akun orang tua dulu.' });
    const [subs, kids] = await Promise.all([
      db(`family_subscriptions?select=student_id,plan,status,current_period_end&parent_id=eq.${encodeURIComponent(parent.id)}`),
      db(`parent_students?select=student_id&parent_id=eq.${encodeURIComponent(parent.id)}`),
    ]);
    const linked = new Set((kids || []).map((x) => x.student_id));
    const active = (subs || []).filter((s) => linked.has(s.student_id) && s.status === 'active' && Date.parse(s.current_period_end) > Date.now());
    return res.status(200).json({ active: active.length > 0, subscriptions: active.map((s) => ({ studentId: s.student_id, plan: s.plan, currentPeriodEnd: s.current_period_end })), studentIds: [...linked] });
  } catch (e) { return res.status(503).json({ error: 'Status paket belum tersedia di server.' }); }
};
