# OAuth Guest Management System

## Overview

This implementation provides a complete OAuth authentication system with bulk guest import functionality for the wedding website. Users can authenticate and manage wedding guest lists through an intuitive admin panel.

## Features

### 1. **Authentication (OAuth)**
- Google OAuth integration
- GitHub OAuth integration
- Demo user access for testing
- Session management with secure cookies
- Protected admin routes with middleware

### 2. **Guest Management**
- **Add Individual Guests**: Form-based guest addition with comprehensive fields
- **Bulk Import**: CSV file upload for importing multiple guests
- **Guest Fields**:
  - Khmer Name (required)
  - English Name
  - Title/Position
  - Relationship (family, friend, colleague, vip, guest)
  - Status (pending, sent, confirmed, declined)

### 3. **User Interface**
- Modern, responsive design with Tailwind CSS
- Gradient backgrounds and smooth animations
- Tabbed interface for switching between add/bulk modes
- Real-time validation and error handling
- Quick reference guide and CSV format examples

## File Structure

```
app/
├── admin/
│   └── guests/
│       └── page.tsx                 # Main admin dashboard
├── api/
│   ├── auth/
│   │   ├── google/route.ts         # Google OAuth callback
│   │   ├── github/route.ts         # GitHub OAuth callback
│   │   ├── me/route.ts             # Get current user
│   │   └── logout/route.ts         # Logout endpoint
│   └── guests/
│       └── import/route.ts         # Guest import API
├── auth/
│   └── login/
│       └── page.tsx                # OAuth login page
└── page.tsx                        # Home page with admin button

components/
├── BulkImportForm.tsx              # CSV bulk import component
├── SingleGuestForm.tsx             # Single guest form component
├── AdminButton.tsx                 # Floating admin access button
└── ...

providers/
├── AuthContext.tsx                 # Authentication state management
└── ...

middleware.ts                       # Route protection middleware
```

## Getting Started

### 1. Access the Login Page

Click the "Admin" button in the bottom-right corner of the home page, or navigate to `/auth/login`.

### 2. Login Options

**OAuth Providers:**
- **Google**: Sign in with your Google account
- **GitHub**: Sign in with your GitHub account
- **Demo User**: Test without authentication (for development)

### 3. Add Guests

#### Option A: Add Single Guest
1. Click the "Add Guest" tab
2. Fill in the guest details:
   - Khmer Name (required)
   - English Name (optional)
   - Title/Position (optional)
   - Relationship type
   - RSVP Status
3. Click "Add Guest"

#### Option B: Bulk Import
1. Click the "Bulk Import" tab
2. Prepare your CSV file with the following columns:
   ```
   khmerName,englishName,title,relationship,status
   ```
3. Drag and drop or select your CSV file
4. Click "Import Guests"

### CSV Format Example

```csv
khmerName,englishName,title,relationship,status
ចាន់ ធីដា,Chan Thida,អ្នកនាង,friend,pending
ហៀង សុផុន,Heang Sophorn,ឯកឧត្តម,vip,sent
ខួន ពិនុច,Khoun Pinuch,អ្នកនាង,vip,confirmed
```

## API Routes

### Authentication

#### `POST /api/auth/logout`
Clears authentication session and logs out the user.

**Response:**
```json
{ "success": true }
```

#### `GET /api/auth/me`
Returns the current authenticated user's information.

**Headers Required:**
- `Authorization: Bearer <token>` or Cookie with `auth_token`

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "Demo User",
  "provider": "local"
}
```

#### `GET /api/auth/google`
OAuth callback from Google.

#### `GET /api/auth/github`
OAuth callback from GitHub.

### Guest Import

#### `POST /api/guests/import`
Add or import guests.

**Headers Required:**
- `Authorization: Bearer <token>` or Cookie with `auth_token`

**Request Body:**
```json
{
  "guests": [
    {
      "khmerName": "ឈ្មោះ​ខ្មែរ",
      "englishName": "English Name",
      "title": "Title",
      "relationship": "friend",
      "status": "pending"
    }
  ],
  "type": "single" | "bulk"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully imported 1 guest(s)",
  "addedCount": 1
}
```

**Response (Partial Success):**
```json
{
  "success": false,
  "message": "Validation failed for 1 guest(s)",
  "errors": [
    { "row": 1, "error": "Khmer name is required" }
  ],
  "addedCount": 0
}
```

#### `PUT /api/guests/import`
Upload and parse CSV file.

**Headers Required:**
- `Authorization: Bearer <token>` or Cookie with `auth_token`

**Request:**
- Form data with `file` field (CSV file)

**Response:**
```json
{
  "success": true,
  "message": "Parsed 10 guest(s)",
  "guests": [
    {
      "khmerName": "ឈ្មោះ​ខ្មែរ",
      "englishName": "English Name",
      "title": "Title",
      "relationship": "friend",
      "status": "pending"
    }
  ]
}
```

## Environment Variables

For production OAuth integration, configure these variables:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_secret
NEXT_PUBLIC_GITHUB_CLIENT_SECRET=your_github_secret
```

## Authentication Flow

### Setup

1. **Register OAuth Applications**
   - Google Cloud Console
   - GitHub Developer Settings
   - Configure redirect URIs to `https://yourdomain.com/api/auth/[provider]/callback`

2. **Environment Configuration**
   - Add client IDs and secrets to environment variables

### Login Flow

1. User clicks login button
2. Redirected to OAuth provider
3. User authenticates with provider
4. Callback to `/api/auth/[provider]`
5. Server exchanges code for token
6. User data retrieved from provider
7. Session created with auth cookie
8. Redirect to admin panel

### Protected Routes

The middleware automatically redirects unauthenticated users trying to access `/admin/*` routes to `/auth/login`.

## Customization

### Add More OAuth Providers

1. Create new route file: `/app/api/auth/[provider]/route.ts`
2. Implement OAuth flow for the provider
3. Add button to login page
4. Update AuthContext if needed

### Customize Guest Fields

1. Update the `Guest` interface in [data/guestList.ts](data/guestList.ts)
2. Update form components to include new fields
3. Update API validation logic
4. Update CSV parsing to handle new columns

### Styling

All components use Tailwind CSS and can be customized by modifying the className attributes. The theme is consistent with the existing wedding website design.

## Security Considerations

### Current Implementation (Demo)

This is a mock implementation for demonstration. In production:

1. **Never expose secrets** - Keep OAuth secrets on the backend only
2. **Validate tokens** - Verify JWT or session tokens properly
3. **Sanitize input** - Validate and sanitize all user inputs
4. **Rate limiting** - Implement rate limiting on auth endpoints
5. **HTTPS only** - Ensure all auth traffic uses HTTPS
6. **Secure cookies** - Use `httpOnly`, `secure`, and `sameSite` flags
7. **CSRF protection** - Implement CSRF tokens for state parameter

### Database Considerations

Currently, guests are not persisted to a database. To implement persistent storage:

1. Create a database schema for guests
2. Implement database operations in `/api/guests/import`
3. Update the admin dashboard to fetch and display all guests
4. Implement guest editing and deletion

## Troubleshooting

### Login Issues

- Check that cookies are enabled
- Verify OAuth credentials are correct
- Check browser console for error messages

### Import Failures

- Verify CSV format matches the template
- Check for special characters that need escaping
- Ensure all required fields are present

### Route Access

- Make sure you're authenticated before accessing `/admin/*` routes
- Clear cookies and re-login if issues persist

## Future Enhancements

- [ ] Database integration for persistent storage
- [ ] Guest editing and deletion
- [ ] Advanced filtering and sorting
- [ ] Email notifications for guests
- [ ] RSVP tracking dashboard
- [ ] Guest attendance tracking
- [ ] Data export functionality
- [ ] Multi-language support
- [ ] Two-factor authentication
- [ ] Admin role management
