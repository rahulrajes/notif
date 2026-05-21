// background.js — service worker
// Receives messages from content.js, checks user settings, fires notifications.

chrome.runtime.onMessage.addListener(function (message, sender) {

  if (message.type === 'POLL_STARTED') {

    // Mark poll as active in storage — popup reads this to show the LIVE badge
    chrome.storage.local.set({ pollActive: true });

    // Set the "LIVE" text badge on the toolbar icon
    chrome.action.setBadgeText({ text: 'LIVE' });
    chrome.action.setBadgeBackgroundColor({ color: '#1a7a1a' });

    // Read user settings before doing anything
    chrome.storage.local.get(
      { notificationsEnabled: true, soundEnabled: true },
      function (settings) {

        if (settings.notificationsEnabled) {
          chrome.notifications.create('poll-active', {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: '🔔 Poll question is live!',
            message: message.platform + ' — switch to the tab and answer now.',
            priority: 2,
          });
        }

        // Sound is played by the content script (not here) because
        // service workers can't use the Web Audio API.
        // We send a message back to the tab that reported the poll.
        if (settings.soundEnabled && sender.tab) {
          chrome.tabs.sendMessage(sender.tab.id, { type: 'PLAY_SOUND' });
        }
      }
    );
  }

  if (message.type === 'POLL_ENDED') {
    chrome.storage.local.set({ pollActive: false });

    // Clear the badge
    chrome.action.setBadgeText({ text: '' });
  }
});
