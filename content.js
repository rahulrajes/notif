// content.js
// Injected into both student.iclicker.com and app.tophat.com.
// Detects which platform it's on, watches for polls, messages background.js.

(function () {
  'use strict';

  // ── Which platform are we on? ──
  const hostname = window.location.hostname;
  const PLATFORM = hostname.includes('iclicker') ? 'iClicker' : 'TopHat';

  // ── Platform-specific selectors ──
  // iClicker: CONFIRMED from a live poll DOM (Sep 2026). iClicker is an Angular
  //   app; a live poll mounts an <app-poll> custom element that wraps the whole
  //   question. Custom-element tag names are stable across builds (unlike the
  //   hashed _ngcontent/_nghost attributes), so <app-poll> is the primary signal.
  // TopHat: still unconfirmed guesses — confirm against a live TopHat poll.
  const SELECTORS = {
    iClicker: [
      'app-poll',                     // primary — the whole poll component
      'app-multiple-choice-question', // question body (per-type app-*-question)
      '.answer-controls-container',   // the answer buttons
      '.question-type-container',     // question container
    ],
    TopHat: [
      '[data-test-id="question-card"]',
      '[class*="QuestionWidget"]',
      '[class*="question-widget"]',
      '[class*="EngagementPane"] [class*="active"]',
    ],
  };

  const mySelectors = SELECTORS[PLATFORM];

  // ── State ──
  let pollActive = false;

  // ── Detection ──
  function isPollVisible() {
    return mySelectors.some(function (selector) {
      return document.querySelector(selector) !== null;
    });
  }

  // ── DOM change handler ──
  function onDomChange() {
    const questionNow = isPollVisible();

    if (questionNow && !pollActive) {
      pollActive = true;
      console.log('[notif] 🔔 Poll detected on ' + PLATFORM);
      chrome.runtime.sendMessage({ type: 'POLL_STARTED', platform: PLATFORM });

    } else if (!questionNow && pollActive) {
      pollActive = false;
      console.log('[notif] Poll ended on ' + PLATFORM);
      chrome.runtime.sendMessage({ type: 'POLL_ENDED', platform: PLATFORM });
    }
  }

  // ── Observer ──
  const observer = new MutationObserver(onDomChange);
  observer.observe(document.body, { childList: true, subtree: true });

  console.log('[notif] Watching ' + PLATFORM + ' for polls...');

})();
