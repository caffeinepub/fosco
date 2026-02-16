# Specification

## Summary
**Goal:** Build FOSCO: a sign-in-required, phone-number-based directory that enables 1:1 WebRTC video/audio calling with screen casting in a co-watching layout (large screen-cast area + bottom-left facetime overlay).

**Planned changes:**
- Add required Internet Identity sign-in, followed by a required profile step to collect, store, view, and update the user’s phone number (plain text) before accessing calling features.
- Implement backend directory + presence APIs: map phone number ↔ principal, enforce unique phone numbers, and expose lookup by phone number plus an availability check/list.
- Implement canister-mediated WebRTC signaling (offer/answer/ICE) using polling, with reliable call setup/teardown.
- Add outgoing call UX (phone-number input + Call action) and in-call controls (at minimum End call).
- Add incoming call UX within the facetime window (Incoming call + Answer/Decline), only starting WebRTC connection on answer.
- Implement the main layout: large movie/screen-cast area with a smaller bottom-left facetime overlay that stays visible during viewing/casting.
- Add screen sharing to show the shared stream in the large movie window for both users, including start/stop and permission-denied error handling.
- Enforce “only one active screen cast at a time” per call session via backend session state with a clear English reminder message when blocked.
- Add fullscreen mode for the movie/screen-cast area while keeping the bottom-left facetime overlay visible and smaller in fullscreen.
- Apply a consistent FOSCO visual theme (not default-looking; avoid a blue/purple primary palette) across sign-in/profile, calling UI, controls, and screen-share states.

**User-visible outcome:** Users sign in with Internet Identity, enter a required phone number, call other signed-in users by phone number for a 1:1 video/audio call, answer/decline incoming calls, share their screen into a large viewing area with a bottom-left facetime overlay, and use fullscreen while keeping the overlay visible.
