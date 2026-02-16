# Specification

## Summary
**Goal:** Fix the incoming call flow so the callee’s “Answer” and “Decline” buttons always perform the correct actions and transition call state correctly.

**Planned changes:**
- Backend: Update the call status model for incoming calls to include the caller’s Principal, and adjust call lifecycle methods so callee answer/decline works reliably and resets both users to idle when declined.
- Backend: Add/adjust upgrade-safe migration logic to handle persisted call state after the CallStatus type change (e.g., clear/transform old incoming entries).
- Frontend: Wire the incoming call UI to use the caller Principal from the incoming-call payload; ensure Answer/Decline call the correct backend mutations and the prompt remains clickable during the incoming state.

**User-visible outcome:** When receiving a call, the callee can successfully press “Answer” to enter the in-call state or “Decline” to reject/end the call, returning both users to an idle/available state without dead buttons or backend traps.
