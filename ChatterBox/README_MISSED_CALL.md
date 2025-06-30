# Missed Call Functionality

## Overview
This feature notifies users of missed calls in the chat app, both visually (toast) and as a persistent system message in the chat history. It works for both audio and video calls.

---

## Backend Implementation

- **Socket Event:**
  - When the caller hangs up before the receiver answers, the frontend emits a `call-hang-up` event with `otherUserId`, `callType`, and `conversationId`.
  - The backend handler (`hangUpHandler.js`) creates a new `System` message (type: `"System"`, content: `"Missed audio/video call"`) and saves it to the conversation in MongoDB.
  - The backend emits a `missed_call_message` event to **both** the sender and receiver, containing the new message and conversation ID.

- **Persistence:**
  - The missed call message is stored in the conversation's messages array and will appear in chat history after refresh.

---

## Frontend Implementation

- **Socket Handling:**
  - The frontend listens for the `missed_call_message` event in `SocketContext.jsx`.
  - When received, it dispatches `AddMessage` to add the missed call message to Redux (if not already present) and shows a toast notification.
  - This works for both sender and receiver, so both see the missed call message in their chat.

- **Chat Rendering:**
  - The missed call message is rendered in the chat using the `TextMessage` component, styled with a red accent, phone icon, and timestamp.
  - The message is aligned like a normal message (right for sender, left for receiver) and is visually distinct from regular messages.

---

## Event Flow
1. Caller initiates a call.
2. Caller hangs up before receiver answers.
3. Frontend emits `call-hang-up` with `conversationId`.
4. Backend creates a `System` message and emits `missed_call_message` to both users.
5. Both users see a toast and a persistent missed call message in their chat.

---

## Notes
- Only the caller hanging up triggers a missed call message.
- The message is persistent and visible in chat history for both users.
- The message includes a timestamp and is styled for high visibility. 