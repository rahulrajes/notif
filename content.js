// content.js
// Injected into both student.iclicker.com and app.tophat.com.
// Detects which platform it's on, watches for polls, messages background.js.

(function () {
  'use strict';

  // ── Which platform are we on? ──
  const hostname = window.location.hostname;
  const PLATFORM = hostname.includes('iclicker') ? 'iClicker' : 'TopHat';

  // ── Platform-specific selectors ──
  // These are best guesses. Confirm with DevTools during a live class.
  // Right-click the poll element → Inspect → copy a unique attribute or class.
  const SELECTORS = {
    iClicker: [
      '[data-testid="active-question"]',
      '[class*="ActiveQuestion"]',
      '[class*="active-question"]',
      '[class*="polling"][class*="open"]',
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
