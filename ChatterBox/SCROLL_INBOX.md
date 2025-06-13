# ChatterBox

A modern chat application with real-time messaging capabilities.

## Features

### Chat Scroll Functionality

The chat interface includes intelligent scroll behavior similar to WhatsApp:

1. **Auto-Scroll on New Messages**
   - Automatically scrolls to the bottom when new messages arrive
   - Only auto-scrolls if the user is already near the bottom of the chat
   - Maintains scroll position when user is reading older messages

2. **Scroll to Bottom Button**
   - Appears when user scrolls up from the bottom
   - Fixed position at bottom-right of chat window
   - Smooth scroll animation when clicked
   - Disappears when user is at the bottom
   - Styled with the app's primary color theme
<!-- 
3. **New Message Indicator**
   - Shows when new messages arrive while user is scrolled up
   - Displays "New message" with a down arrow
   - Clicking scrolls to the latest message
   - Automatically hides when user scrolls to bottom -->

4. **Visual Design**
   - Modern, floating button design
   - Smooth animations and transitions
   - Consistent with app's color scheme
   - Responsive to dark/light mode
   - Backdrop blur effect for better visibility

## Technical Implementation

The scroll functionality is implemented using:
- React refs for DOM manipulation
- useEffect hooks for scroll event handling
- State management for UI indicators
- Smooth scroll behavior
- Event listeners for scroll position tracking

## Usage

The scroll behavior is automatic and requires no user configuration. Users can:
- Scroll up to view message history
- Click the scroll button to return to latest messages
- Click the new message indicator to view new messages
- Let the chat auto-scroll when at the bottom

## Future Improvements

Potential enhancements:
- Message read receipts
- Typing indicators
- Message search functionality
- Message reactions
- File sharing capabilities