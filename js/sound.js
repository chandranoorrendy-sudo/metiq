/* Metiq — efek suara sederhana dengan Web Audio (tanpa file suara).
 * Benar: dua nada naik. Salah: nada rendah lembut. Mahir: arpeggio. Tuntas dan tugas selesai: fanfare.
 * Bisa dimatikan; pilihan disimpan di perangkat.
 */
(function () {
  let ctx = null;
  const KEY = 'metiq_sound';
  const enabled = () => { try { return localStorage.getItem(KEY) !== '0'; } catch (e) { return true; } };
  function audio() {
    if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, at, dur, type = 'sine', vol = 0.18, glideTo) {
    const c = audio(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  const play = (fn) => { if (enabled()) { try { fn(); } catch (e) { /* suara tidak wajib */ } } };

  window.SFX = {
    enabled,
    toggle() { const on = !enabled(); try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} if (on) this.correct(); return on; },
    correct() { play(() => { tone(784, 0, 0.12, 'sine', 0.2); tone(1175, 0.09, 0.2, 'sine', 0.18); }); },
    wrong() { play(() => { tone(330, 0, 0.3, 'triangle', 0.15, 220); }); },
    levelUp() { play(() => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.18, 'sine', 0.16)); }); },
    mastered() { play(() => { [523, 659, 784, 1047, 784, 1047].forEach((f, i, a) => tone(f, i * 0.11, i === a.length - 1 ? 0.55 : 0.16, 'triangle', 0.2)); [262, 330, 392].forEach((f) => tone(f, 0.66, 0.7, 'sine', 0.07)); }); },
    task() { play(() => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.2, 'square', 0.07)); [523, 659, 784].forEach((f) => tone(f, 0.5, 0.8, 'sine', 0.09)); }); },
  };
})();
