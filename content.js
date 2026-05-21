// content.js
// Injected into every student.iclicker.com page by Chrome.
// Watches the DOM for poll questions, messages the service worker,
// and plays a sound if told to by the service worker.

(function () {
  'use strict';

  // --- State ---
  let pollActive = false;

  // --- Selectors ---
  // CSS selectors for elements that appear when a poll is live.
  // These are our best guesses — we'll confirm by inspecting the
  // page in DevTools during a live class session.
  const POLL_SELECTORS = [
    '[data-testid="active-question"]',
    '[class*="ActiveQuestion"]',
    '[class*="active-question"]',
    '[class*="polling"][class*="open"]',
  ];

  // --- Detection ---
  function isPollVisible() {
    return POLL_SELECTORS.some(function (selector) {
      return document.querySelector(selector) !== null;
    });
  }

  // --- DOM change handler ---
  function onDomChange() {
    const questionNow = isPollVisible();

    if (questionNow && !pollActive) {
      pollActive = true;
      console.log('[notif] 🔔 Poll detected — notifying background.');
      chrome.runtime.sendMessage({ type: 'POLL_STARTED', platform: 'iClicker' });

    } else if (!questionNow && pollActive) {
      pollActive = false;
      console.log('[notif] Poll ended.');
      chrome.runtime.sendMessage({ type: 'POLL_ENDED', platform: 'iClicker' });
    }
  }

  // --- Sound playback ---
  // Service workers can't play audio, so background.js sends a message back
  // here and we play the sound from inside the page context where Audio works.
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.type === 'PLAY_SOUND') {
      playAlert();
    }
  });

  function playAlert() {
    // We generate a short beep using the Web Audio API — no audio file needed.
    // This works even if the user's iClicker tab is in the background.
    try {
      const ctx  = new AudioContext();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type      = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);          // A5 note
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6); // fade out

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('[notif] Could not play sound:', e);
    }
  }

  // --- Observer ---
  const observer = new MutationObserver(onDomChange);
  observer.observe(document.body, { childList: true, subtree: true });

  console.log('[notif] Content script loaded. Watching student.iclicker.com...');

})();
