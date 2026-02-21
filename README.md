# Workspace MVP (Next.js + Firebase)

This is a fully functional MVP internal workspace app with:
- Email/password authentication (Firebase Auth)
- Personal workspace data
- Team spaces with Owner/Member roles
- Goals and Kanban tasks with drag-and-drop
- Task comments

## Tech stack
- Next.js 14 (App Router)
- TypeScript
- Firebase Auth + Firestore
- Tailwind CSS
- `@dnd-kit` for drag-and-drop

## Firestore data model

### `users/{userId}`
- `id`
- `email`
- `emailLower`
- `createdAt`

### `teams/{teamId}`
- `name`
- `ownerUserId`
- `createdAt`
- `updatedAt`

### `teamMemberships/{teamId_userId}`
- `id`
- `teamId`
- `userId`
- `role` (`owner` | `member`)
- `createdAt`

### `goals/{goalId}`
- `workspaceType` (`personal` | `team`)
- `workspaceId` (user id for personal, team id for team)
- `title`
- `description`
- `dueDate`
- `status` (`Active` | `Completed`)
- `createdAt`
- `updatedAt`

### `tasks/{taskId}`
- `goalId`
- `workspaceType`
- `workspaceId`
- `title`
- `status` (`todo` | `in_progress` | `done`)
- `dueDate`
- `assigneeUserId` (`string | null`, team tasks only)
- `createdAt`
- `updatedAt`

### `comments/{commentId}`
- `taskId`
- `goalId`
- `workspaceType`
- `workspaceId`
- `authorUserId`
- `text`
- `createdAt`

## Local setup (step-by-step)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Firebase project**
   - Go to Firebase Console.
   - Click **Add project** and complete the project creation flow.

3. **Enable Email/Password auth**
   - In Firebase Console, open **Authentication**.
   - Click **Get started**.
   - Under **Sign-in method**, enable **Email/Password**.

4. **Create Firestore database**
   - Open **Firestore Database**.
   - Click **Create database**.
   - Use **production mode**.
   - Pick your region.

5. **Configure Firestore security rules**
   - In Firestore, open **Rules**.
   - Copy contents of `firestore.rules` into the editor.
   - Publish rules.

6. **Create required Firestore indexes**
   - In Firestore, open **Indexes**.
   - Add composite indexes from `firestore.indexes.json`:
     - Collection: `goals`, fields: `workspaceType` ascending + `workspaceId` ascending.
     - Collection: `tasks`, fields: `workspaceType` ascending + `workspaceId` ascending.

7. **Copy Firebase web app credentials**
   - In Firebase Console, go to **Project settings**.
   - Under **Your apps**, create/select a web app.
   - Copy the SDK config values.

8. **Add environment variables**
   - Copy `.env.example` to `.env.local`.
   - Paste your Firebase values:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

9. **Run the app**
   ```bash
   npm run dev
   ```

10. **Open in browser**
    - Visit `http://localhost:3000`.
    - Sign up with email/password.
    - You will land on the personal dashboard.

## Notes
- Route protection is enforced by middleware and client auth state.
- Team Owners can create teams and add members by email.
