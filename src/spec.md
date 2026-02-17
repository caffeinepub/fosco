# Specification

## Summary
**Goal:** Ensure callees reliably see and can act on an incoming call prompt (Answer/Decline), and that answering/declining transitions call state correctly and connects via WebRTC.

**Planned changes:**
- Fix the Facetime overlay UI state handling so that when the backend call status is incoming for the callee, the IncomingCallPrompt renders (not the “No active call” idle state).
- Wire “Answer” and “Decline” controls to the correct backend mutations and handle rejected mutations by showing an English error message without leaving the UI in an inconsistent state.
- Update callee-side WebRTC signaling handling to process already-received offer/ICE messages after the peer connection is created when the callee answers.

**User-visible outcome:** When someone calls a user, the callee consistently sees an “Incoming Call” prompt with “Answer” and “Decline”; tapping either reliably answers/declines the call, and answering connects without requiring the caller to try again.
