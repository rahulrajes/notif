# notif

A Chrome extension that notifies you when a new poll question appears on iClicker or TopHat — so you never miss participation points.

## What this does

- Watches the iClicker and TopHat student pages for new poll questions
- Fires a desktop notification the moment a question appears
- Optionally plays a sound alert

## What this does NOT do

This extension **notifies only**. It does not answer questions for you. Auto-answering is academic dishonesty. This project sits firmly on the right side of that line.

## Installation (development)

1. Clone this repo
2. Open Chrome → go to `chrome://extensions`
3. Toggle **Developer mode** on (top right)
4. Click **Load unpacked** → select this folder
5. Navigate to `student.iclicker.com` or `app.tophat.com`

## Supported platforms

- [x] iClicker (`student.iclicker.com`)
- [ ] TopHat (`app.tophat.com`) — coming in a later phase

## Tech

Plain JavaScript, Manifest V3, no build step required.


## RAHUL TESTING (run these on chrome console)
chrome.tabs.query({ url: 'https://student.iclicker.com/*' }, t => chrome.tabs.sendMessage(t[0].id, { type: 'PLAY_SOUND' }))
chrome.storage.local.clear()
chrome.storage.local.set({ pollActive: true, currentFriend: 'rishi.png' })
chrome.notifications.create('test', { type: 'basic', iconUrl: 'icons/icon128.png', title: '🔔 Poll question is live!', message: 'iClicker — switch to the tab and answer now.', priority: 2 });
