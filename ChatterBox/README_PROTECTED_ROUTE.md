# Protected Route Implementation

## Overview
This feature ensures that only authenticated users can access protected pages (like the dashboard), and unauthenticated users are redirected to login. It also prevents logged-in users from accessing auth pages (login, signup, verify).

---

## Components

### 1. ProtectedRoute
- **Purpose:**
  - Only allows access to children if the user is logged in.
  - If not, redirects to `/auth/login`.
- **Logic:**
  - Checks if `user` and `user.id` exist in Redux state.
  - Uses `useSelector` to get the user, and `Navigate` from `react-router-dom` for redirection.
  - Defensive: If user state is undefined, renders nothing to avoid redirect loops.

### 2. GuestRoute
- **Purpose:**
  - Only allows access to children if the user is NOT logged in.
  - If logged in, redirects to `/dashboard`.
- **Logic:**
  - Checks if `user && user.id` exist in Redux state.
  - Uses `useSelector` and `Navigate` for logic and redirection.

---

## Usage in App.jsx
- Auth pages (`/auth/login`, `/auth/signup`, `/auth/verify`) are wrapped in `<GuestRoute>`.
- Main app pages (`/dashboard`, etc.) are wrapped in `<ProtectedRoute>`.
- The root route `/` redirects to `/auth/login`.

---

## User State
- On login, `user` is set in Redux with a valid `id`.
- On logout, `user` is set to `null`.
- Both route guards rely on this state for access control.

---

## Edge Cases Handled
- Prevents redirect loops by checking for undefined user state.
- Ensures users cannot access protected pages after logout, or auth pages after login.

---

## Example
```jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Layout/>
  </ProtectedRoute>
}>
  <Route index element={<Messages/>}/>
  <Route path = "profile" element={<ProfilePage/>} />
</Route>
``` 