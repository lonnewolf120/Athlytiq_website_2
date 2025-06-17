# Delete Account Screen Implementation Plan

This document outlines the detailed plan for implementing the delete account screen at `app/auth/delete-account/page.tsx` and its corresponding backend API.

## Proposed Plan:

### Phase 1: Frontend Implementation (`app/auth/delete-account/page.tsx`)

1.  **Initial Page Structure:**
    *   Create a React component for the page.
    *   Import necessary UI components from `@/components/ui` such as `Card`, `CardHeader`, `CardContent`, `Button`, `Input`, `Label`.
    *   Import `supabase` from `@/lib/supabase`.
    *   Import `useToast` from `@/hooks/use-toast` for notifications.
    *   Import `useRouter` from `next/navigation` for redirection.
    *   Add state variables for `isLoading` (boolean), `email` (string), `password` (string), and `isSignedIn` (boolean) to manage the form state and flow.
    *   Include a back button to navigate to the previous page, similar to the `app/auth/page.tsx` layout.

2.  **Sign-in Form:**
    *   Implement a sign-in form that is displayed when `isSignedIn` is `false`. This form will allow the user to re-authenticate before proceeding with deletion.
    *   The form will include input fields for email and password.
    *   The `handleSubmit` function will use `supabase.auth.signInWithPassword` to authenticate the user.
    *   Upon successful sign-in, set `isSignedIn` to `true` and clear the form fields.
    *   Display toast messages for success or error using `useToast`.

3.  **Delete Account Prompt:**
    *   Conditionally render this section only when `isSignedIn` is `true`.
    *   Display a clear warning message about the irreversible nature of account deletion.
    *   Include a confirmation input field (e.g., "Type 'DELETE' to confirm") to prevent accidental deletion.
    *   Add a "Delete Account" button, which will be disabled until the confirmation text is correctly entered.

4.  **Delete Account Logic:**
    *   When the "Delete Account" button is clicked:
        *   Verify that the confirmation input matches "DELETE".
        *   Call a new API route (e.g., `/api/delete-account`) to handle the actual user deletion. This is crucial for security, as direct client-side user deletion is generally not recommended. The API route will receive the user's token and perform the deletion on the server.
        *   Display toast messages for success or error.
        *   Upon successful deletion, redirect the user to a confirmation page or the home page (`/`).

### Phase 2: Backend API Route Implementation (`app/api/delete-account/route.ts`)

1.  **Create New API Route:**
    *   Create a new file: `app/api/delete-account/route.ts`.
    *   This route will handle `POST` requests.

2.  **Authentication and Authorization:**
    *   Import `createRouteHandlerClient` from `@supabase/auth-helpers-nextjs` to create a Supabase client that can access cookies, ensuring server-side authentication.
    *   Retrieve the user's session from the request.
    *   If no session is found, return an unauthorized response.

3.  **User Deletion:**
    *   Use `supabase.auth.admin.deleteUser(userId)` to delete the user. This operation requires a service role key and should only be performed on the server.
    *   Handle potential errors during deletion (e.g., user not found, permission issues).
    *   Return appropriate JSON responses (success/error).

### Phase 3: Routing and Navigation

1.  The `app/auth/delete-account/page.tsx` route will be automatically accessible.
2.  Consider adding a link to this page from the user's profile or settings page (this is outside the scope of this task but a good future consideration).

## Flow Diagram:

```mermaid
graph TD
    A[User navigates to /auth/delete-account] --> B{Is user authenticated?};
    B -- No --> C[Display Sign-in Form];
    C --> D{User submits credentials};
    D -- Authentication Success --> E[Set isSignedIn = true];
    D -- Authentication Failure --> C;
    E --> F[Display Delete Account Prompt];
    F --> G{User types 'DELETE' and clicks button};
    G -- Confirmation Match --> H[Call /api/delete-account API];
    H -- API Success --> I[Account Deleted Successfully];
    I --> J[Redirect to Home Page];
    H -- API Failure --> K[Display Error Message];
    G -- Confirmation Mismatch --> F;