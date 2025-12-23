# File Locations & Usage Guide

## 🎯 Where to Find Everything

### Authentication & OAuth

#### AuthContext Provider
- **File:** [providers/AuthContext.tsx](providers/AuthContext.tsx)
- **What it does:** Manages global authentication state
- **How to use:** Wrapped around app in `ClientLayout.tsx`
- **Hook:** `useAuth()` - Use to access user and auth functions

#### OAuth Routes
- **Google:** [app/api/auth/google/route.ts](app/api/auth/google/route.ts)
- **GitHub:** [app/api/auth/github/route.ts](app/api/auth/github/route.ts)
- **Logout:** [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts)
- **Get User:** [app/api/auth/me/route.ts](app/api/auth/me/route.ts)

#### Route Protection
- **File:** [middleware.ts](middleware.ts)
- **What it does:** Redirects unauthenticated users from `/admin/*` routes to login
- **Status:** Automatically applied to all `/admin` routes

### User Interface

#### Login Page
- **Route:** `/auth/login`
- **File:** [app/auth/login/page.tsx](app/auth/login/page.tsx)
- **Features:**
  - Google OAuth button
  - GitHub OAuth button
  - Demo user option
  - Feature highlights

#### Admin Dashboard
- **Route:** `/admin/guests`
- **File:** [app/admin/guests/page.tsx](app/admin/guests/page.tsx)
- **Features:**
  - Guest statistics
  - Tabbed interface
  - Recently added guests
  - CSV format guide

#### Admin Button (Home Page)
- **Component:** [components/AdminButton.tsx](components/AdminButton.tsx)
- **Location:** Bottom-right corner of home page
- **What it does:** Links to OAuth login page

### Guest Management Components

#### Single Guest Form
- **File:** [components/SingleGuestForm.tsx](components/SingleGuestForm.tsx)
- **Tab:** "Add Guest" on admin dashboard
- **Fields:** Khmer name, English name, title, relationship, status
- **Validation:** Real-time client & server-side

#### Bulk Import Form
- **File:** [components/BulkImportForm.tsx](components/BulkImportForm.tsx)
- **Tab:** "Bulk Import" on admin dashboard
- **Features:**
  - Drag & drop file upload
  - CSV file selection
  - Progress indication
  - Error messages

### Guest Import API

#### Endpoint: POST /api/guests/import
- **File:** [app/api/guests/import/route.ts](app/api/guests/import/route.ts)
- **Use:** Add single guest or bulk import
- **Payload:** JSON with guests array and type

#### Endpoint: PUT /api/guests/import
- **File:** [app/api/guests/import/route.ts](app/api/guests/import/route.ts)
- **Use:** Upload and parse CSV file
- **Payload:** FormData with CSV file

### Updated Files

#### Home Page
- **File:** [app/page.tsx](app/page.tsx)
- **Change:** Added `<AdminButton />` component
- **Visible:** Bottom-right corner of page

#### Client Layout
- **File:** [app/ClientLayout.tsx](app/ClientLayout.tsx)
- **Change:** Wrapped content with `<AuthProvider>`
- **Effect:** Enables auth context throughout app

#### Guest List Data
- **File:** [data/guestList.ts](data/guestList.ts)
- **Added Functions:**
  - `getGuestDisplayName()` - Format guest name with title
  - `findGuestBySlug()` - Find guest by slug
  - `getGuestSlug()` - Generate slug from name

## 📚 Documentation Files

### For End Users
- **File:** [QUICK_START_OAUTH.md](QUICK_START_OAUTH.md)
- **Content:**
  - Step-by-step instructions
  - CSV template examples
  - Common issues & solutions
  - Pro tips

### For Developers
- **File:** [OAUTH_GUEST_MANAGEMENT.md](OAUTH_GUEST_MANAGEMENT.md)
- **Content:**
  - Technical implementation details
  - API endpoint documentation
  - Environment variable setup
  - Security considerations
  - Database integration instructions

### For Architects
- **File:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Content:**
  - Implementation overview
  - File structure
  - Feature checklist
  - Next steps for enhancement

### Quick Help
- **File:** [ACCESS_GUIDE.md](ACCESS_GUIDE.md) ← YOU ARE HERE
- **Content:**
  - How to access admin panel
  - Login options
  - Common tasks
  - Troubleshooting

## 🔗 URL Routes

### Pages
| Route | File | Purpose |
|-------|------|---------|
| `/` | [app/page.tsx](app/page.tsx) | Home page with Admin button |
| `/auth/login` | [app/auth/login/page.tsx](app/auth/login/page.tsx) | OAuth login page |
| `/admin/guests` | [app/admin/guests/page.tsx](app/admin/guests/page.tsx) | Guest management dashboard |

### API Routes
| Route | Method | File | Purpose |
|-------|--------|------|---------|
| `/api/auth/google` | GET | [app/api/auth/google/route.ts](app/api/auth/google/route.ts) | Google OAuth callback |
| `/api/auth/github` | GET | [app/api/auth/github/route.ts](app/api/auth/github/route.ts) | GitHub OAuth callback |
| `/api/auth/me` | GET | [app/api/auth/me/route.ts](app/api/auth/me/route.ts) | Get current user |
| `/api/auth/logout` | POST | [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts) | Logout user |
| `/api/guests/import` | POST | [app/api/guests/import/route.ts](app/api/guests/import/route.ts) | Add guests |
| `/api/guests/import` | PUT | [app/api/guests/import/route.ts](app/api/guests/import/route.ts) | Upload CSV |

## 🧩 Component Dependencies

```
app/ClientLayout.tsx
├── AuthProvider (from AuthContext.tsx)
│   ├── ThemeProvider
│   ├── SplashProvider
│   └── LayoutWrapperOld
│       └── Children (all pages)

app/auth/login/page.tsx
├── uses useRouter() (navigation)
└── no external components

app/admin/guests/page.tsx
├── uses useRouter() (navigation)
├── uses useAuth() (from AuthContext)
├── BulkImportForm component
├── SingleGuestForm component
└── lucide-react icons

components/BulkImportForm.tsx
└── uses fetch() for API calls

components/SingleGuestForm.tsx
├── imports Guest type from guestList.ts
└── uses fetch() for API calls

components/AdminButton.tsx
└── uses Next.js Link component
```

## 🔐 Protected Routes

Routes that require authentication (redirects to login if not authenticated):
- `/admin/*` - Handled by middleware
- Specific page: `/admin/guests`

## 🌐 External Dependencies

None new were added. Uses existing:
- `react` - UI library
- `react-dom` - React DOM rendering
- `next` - Framework & routing
- `framer-motion` - Already in project
- `lucide-react` - Icons (already in project)

## 📝 Type Definitions

### Guest Interface
Located in: [data/guestList.ts](data/guestList.ts)
```typescript
interface Guest {
  khmerName: string;
  englishName?: string;
  title?: string;
  relationship?: string;
  status?: 'pending' | 'sent' | 'confirmed' | 'declined';
}
```

### AuthUser Interface
Located in: [providers/AuthContext.tsx](providers/AuthContext.tsx)
```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github' | 'local';
  accessToken?: string;
}
```

## 🚀 How to Start Development

1. **Run development server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   - Navigate to `http://localhost:3000`

3. **Access admin panel:**
   - Click the purple "Admin" button
   - Choose "Demo User" to test

4. **Make changes:**
   - Edit any file in the locations above
   - Changes auto-reload in browser

## 🔧 Configuration

### For OAuth (Production)

Create `.env.local` file in project root:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_secret
NEXT_PUBLIC_GITHUB_CLIENT_SECRET=your_github_secret
```

## 📊 Data Flow

```
Home Page
    ↓
Click Admin Button
    ↓
AuthContext checks if authenticated
    ↓
No → Redirect to /auth/login
    ↓
Login with Google/GitHub/Demo
    ↓
OAuth callback sets session cookie
    ↓
Redirect to /admin/guests
    ↓
Admin Dashboard Loaded
    ↓
Add Guest or Bulk Import
    ↓
API call to /api/guests/import
    ↓
Server validates data
    ↓
Success/Error response
    ↓
UI shows result
```

## ✨ Quick Reference

### Most Important Files
1. [providers/AuthContext.tsx](providers/AuthContext.tsx) - Auth management
2. [app/auth/login/page.tsx](app/auth/login/page.tsx) - Login UI
3. [app/admin/guests/page.tsx](app/admin/guests/page.tsx) - Admin dashboard
4. [app/api/guests/import/route.ts](app/api/guests/import/route.ts) - Guest API

### Most Important Pages
1. Home page `/` - Click Admin button here
2. Login page `/auth/login` - Authenticate here
3. Admin page `/admin/guests` - Manage guests here

### Most Important Components
1. [components/SingleGuestForm.tsx](components/SingleGuestForm.tsx) - Add one guest
2. [components/BulkImportForm.tsx](components/BulkImportForm.tsx) - Add many guests
3. [components/AdminButton.tsx](components/AdminButton.tsx) - Access admin

---

**Need something?** Find it using this guide!
