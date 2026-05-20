// background.js — the service worker
// Lives in the extension's background, separate from any web page.
// It can't touch the DOM, but it can fire OS notifications.
//
// Service workers are "event-driven": Chrome wakes this up when a message
// arrives, it does its job, then Chrome puts it back to sleep.
// That means you CANNOT store state in plain variables here —
// they get wiped when the worker sleeps. (We'll use chrome.storage if we
// need persistence later.)

// --- Listen for messages from content scripts ---
// Any content.js on any tab can reach this listener via chrome.runtime.sendMessage.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

  if (message.type === 'POLL_STARTED') {
    fireNotification(message.platform);
  }

  // We don't need to do anything special for POLL_ENDED right now,
  // but we receive it so we can add behavior later (e.g. badge reset).
});

// --- Fire the OS notification ---
function fireNotification(platform) {
  chrome.notifications.create(
    'poll-active',   // notification ID — using a fixed ID means a new poll
                     // replaces the old notification instead of stacking duplicates
    {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🔔 Poll question is live!',
      message: platform + ' — switch to the tab and answer now.',
      priority: 2,   // 0–2, where 2 is highest (shows even in Do Not Disturb on some systems)
    }
  );
}
