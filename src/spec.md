# Specification

## Summary
**Goal:** Enable phone-number-based calling by adding a backend phone-number → Principal lookup and updating the frontend call flow to use it, removing the current “principal lookup not available” failure.

**Planned changes:**
- Add a permission-protected backend API that resolves a user Principal from a provided phone number, returning null/None when no match exists.
- Implement the backend lookup by searching the existing in-memory profile map by phone number and returning the corresponding Principal.
- Update the “Make a Call” frontend flow to resolve the callee Principal via the new backend lookup and then call the existing `initiateCall` mutation with that Principal.
- Fix the frontend callee lookup hook to avoid redundant/incorrect calls, and to determine “user exists” vs “user available” by checking availability via the existing `isAvailable(principal)` API.
- Remove the hardcoded toast “Unable to initiate call - principal lookup not available” from the call path and ensure any new/changed user-facing messages are English (and do not contain the misspelling “principle”).

**User-visible outcome:** Users can enter a phone number in the “Make a Call” panel to successfully initiate calls to existing users; if the number is not found or the user is unavailable, the UI shows a clear English error message.
