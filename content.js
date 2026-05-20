// content.js
// This file is injected by Chrome into every student.iclicker.com page.
// It runs alongside the page's own JavaScript — it can see and watch the DOM.
// Phase 1 goal: detect when a poll question appears, log it to console.

(function () {
  'use strict';

  // --- State ---
  // We track whether a poll is currently active so we only fire once per question,
  // not once per DOM mutation (which can be dozens per second).
  let pollActive = false;

  // --- Selectors ---
  // These are CSS selectors for elements that appear on the page when a poll is live.
  // Think of a selector like a description: "find me an element that looks like this."
  // We'll confirm the right ones by inspecting the real iClicker page in DevTools.
  // Listing a few candidates so we can see which one actually matches.
  const POLL_SELECTORS = [
    '[data-testid="active-question"]',
    '[class*="ActiveQuestion"]',
    '[class*="active-question"]',
    '[class*="polling"][class*="open"]',
  ];

  // --- Detection ---
  // Checks the current page DOM for any of our candidate selectors.
  // Returns true if any one of them exists on the page right now.
  function isPollVisible() {
    return POLL_SELECTORS.some(function (selector) {
      return document.querySelector(selector) !== null;
    });
  }

  // --- Reaction ---
  // Called every time the DOM changes (could be hundreds of times per minute).
  // We compare the current state to our saved state and only act on transitions.
  function onDomChange() {
    const questionNow = isPollVisible();

    if (questionNow && !pollActive) {
      // Transition: no poll → poll active. Fire once.
      pollActive = true;
      console.log('[notif] 🔔 New poll question detected!');
    } else if (!questionNow && pollActive) {
      // Transition: poll active → no poll. Reset so we're ready for the next one.
      pollActive = false;
      console.log('[notif] Poll ended.');
    }
  }

  // --- Observer ---
  // MutationObserver is a built-in browser API.
  // You give it a function to call whenever the DOM changes, then tell it what to watch.
  const observer = new MutationObserver(onDomChange);

  observer.observe(document.body, {
    childList: true, // fire when elements are added or removed
    subtree: true,   // watch the entire page, not just direct children of body
  });

  console.log('[notif] Content script loaded. Watching student.iclicker.com...');

})();
// The whole file is wrapped in (function(){ ... })() — this is called an IIFE
// (Immediately Invoked Function Expression). It creates a private scope so our
// variables don't accidentally collide with iClicker's own JavaScript variables.
