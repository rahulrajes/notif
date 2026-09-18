// test.js — logic for the reviewer/dev demo page (test.html).
// Kept in a separate file because Manifest V3's Content Security Policy
// (script-src 'self') blocks inline <script> on extension pages.

(function () {
  'use strict';

  const isExtensionPage =
    typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

  const startBtn  = document.getElementById('btn-start');
  const endBtn    = document.getElementById('btn-end');
  const statusEl  = document.getElementById('status');
  const statusTxt = document.getElementById('status-text');

  // If not running as an extension page, warn and disable — chrome.runtime
  // is undefined on a plain file:// page.
  if (!isExtensionPage) {
    document.getElementById('warn').style.display = 'block';
    startBtn.disabled = true;
    endBtn.disabled = true;
    return;
  }

  function setStatus(active) {
    statusEl.classList.toggle('live', active);
    statusTxt.textContent = active ? 'LIVE — poll active' : 'Inactive';
  }

  // Reflect the REAL state the background script writes to storage.
  chrome.storage.local.get({ pollActive: false }, function (s) {
    setStatus(s.pollActive);
  });
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === 'local' && changes.pollActive) {
      setStatus(changes.pollActive.newValue);
    }
  });

  startBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'POLL_STARTED', platform: 'Demo' });
  });
  endBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'POLL_ENDED', platform: 'Demo' });
  });
})();
