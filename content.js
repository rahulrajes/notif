// content.js
// Injected into every student.iclicker.com page by Chrome.
// Watches the DOM for poll questions and messages the service worker when one appears.

(function () {
  'use strict';

  // --- State ---
  let pollActive = false;

  // --- Selectors ---
  // CSS selectors for elements that appear when a poll is live.
  // These are our best guesses — we'll confirm the real ones by inspecting
  // the page in DevTools during a live class session.
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

  // --- Reaction ---
  function onDomChange() {
    const questionNow = isPollVisible();

    if (questionNow && !pollActive) {
      pollActive = true;
      console.log('[notif] 🔔 Poll detected — sending message to background.');

      // Send a message to background.js (the service worker).
      // chrome.runtime.sendMessage is how content scripts talk to the background.
      // The object we pass is the "message" — we can put anything in it.
      chrome.runtime.sendMessage({
        type: 'POLL_STARTED',
        platform: 'iClicker',
      });

    } else if (!questionNow && pollActive) {
      pollActive = false;
      console.log('[notif] Poll ended.');

      chrome.runtime.sendMessage({
        type: 'POLL_ENDED',
        platform: 'iClicker',
      });
    }
  }

  // --- Observer ---
  const observer = new MutationObserver(onDomChange);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('[notif] Content script loaded. Watching student.iclicker.com...');

})();
