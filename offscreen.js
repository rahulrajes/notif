// offscreen.js — runs in the hidden offscreen document.
// This is the only place in the extension that can reliably play audio.

chrome.runtime.onMessage.addListener(function (message) {
  if (message.type === 'PLAY_SOUND_OFFSCREEN') {
    playBeep();
  }
});

function playBeep() {
  const ctx  = new AudioContext();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);          // A5
  osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);  // E5 — two-tone alert
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.6);
}
