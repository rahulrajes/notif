# notif — notes for Chrome Web Store review

**What the extension does:** shows a desktop notification + plays a sound the
moment a live poll question appears on iClicker (`student.iclicker.com`). It is
notify-only — it never answers questions and sends no data anywhere.

## How to verify every feature WITHOUT a live classroom

The real trigger is an instructor starting a poll in class, which a reviewer
can't reproduce. A built-in **Demo page** simulates it exactly:

1. Install the extension (Load unpacked, or from the Store).
2. Click the **notif** toolbar icon to open the popup.
3. In the popup footer, click **"demo"**. A page titled **notif Demo** opens.
4. Click **"Simulate Poll Start"**. This sends the same internal message a real
   poll sends, so you will see:
   - a **desktop notification** ("Poll question is live!"),
   - an **alert sound**,
   - the toolbar badge change to **LIVE** (red),
   - the popup switch to its active-poll screen (reopen the popup to see it).
5. Click **"Simulate Poll End"** to return to the inactive state (badge clears).

The Demo page runs the identical production code path — no behavior is faked or
duplicated.

## Permission justifications

- **notifications** — show the desktop banner when a poll goes live.
- **storage** — remember the user's on/off settings and the current poll state.
- **offscreen** — play the alert sound (service workers can't play audio, and
  the host page's Content Security Policy blocks audio in content scripts).
- **Host access to `student.iclicker.com`** — the content script watches that
  page for a poll element appearing. (TopHat is shown as "Coming soon" and is
  not yet active.)

## Data use

No user data is collected, stored remotely, or transmitted. Everything runs
locally on the user's machine. There is no backend, no analytics, no network
calls except loading the extension's own bundled files.
