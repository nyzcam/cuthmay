# Quick Start Guide - OAuth Guest Management

## 🚀 Getting Started in 3 Steps

### Step 1: Access the Admin Panel
- Visit the home page
- Click the purple "Admin" button in the bottom-right corner
- Or navigate directly to `/auth/login`

### Step 2: Login
Choose one of these options:
- **Google Sign-In** - Use your Google account
- **GitHub Sign-In** - Use your GitHub account  
- **Demo User** - Test immediately without authentication

### Step 3: Manage Guests
You're now in the admin dashboard!

## 📋 Add Guests - Two Methods

### Method 1: Add One Guest at a Time
**Tab: "Add Guest"**

Perfect for adding individual guests or special cases.

1. Fill in the Khmer name (required)
2. Add English name, title, and other details (optional)
3. Select relationship type and status
4. Click "Add Guest"

**Example:**
```
Khmer Name: ចាន់ ធីដា
English Name: Chan Thida
Title: អ្នកនាង
Relationship: friend
Status: pending
```

### Method 2: Bulk Import via CSV
**Tab: "Bulk Import"**

Perfect for importing 10+ guests at once.

1. Prepare a CSV file with your guest list
2. Drag & drop the file or click to select
3. Click "Import Guests"
4. Done! Check the "Recently Added" panel for confirmation

**CSV Template:**
```csv
khmerName,englishName,title,relationship,status
ចាន់ ធីដា,Chan Thida,អ្នកនាង,friend,pending
ហៀង សុផុន,Heang Sophorn,ឯកឧត្តម,vip,sent
ខួន ពិនុច,Khoun Pinuch,អ្នកនាង,vip,confirmed
```

## 📊 Dashboard Features

### Stats Overview
- **Total Guests** - Count of all guests
- **Confirmed** - Guests who said yes
- **Pending** - Guests awaiting response

### Recently Added Panel
- See the last guests you added
- Confirmation with timestamps
- Quick overview of your additions

## 🔑 Authentication Options

### Google OAuth
- Sign in with your Google account
- Fastest option if you have Gmail
- Automatically syncs profile picture

### GitHub OAuth
- Sign in with your GitHub account
- Great for technical users
- Can manage with your Git credentials

### Demo User
- No authentication needed
- Perfect for testing
- Full access to all features
- **Note:** Changes won't be saved

## 📥 CSV Import Tips

### Column Order
The first row should contain headers. Order doesn't matter:
```
khmerName,englishName,title,relationship,status
```

### Required Fields
- **khmerName** - Must be provided for each guest

### Optional Fields
- **englishName** - English translation (recommended)
- **title** - Mr., Mrs., Dr., etc.
- **relationship** - How they relate to you
- **status** - Current RSVP status

### Relationship Types
- `family` - Family members
- `friend` - Friends
- `colleague` - Work colleagues
- `vip` - VIP guests
- `guest` - General guests

### RSVP Status
- `pending` - Awaiting response
- `sent` - Invitation sent
- `confirmed` - Attending
- `declined` - Not attending

### Example CSV
```csv
khmerName,englishName,title,relationship,status
សៅ រិទ្ធ,Sau Rith,លោក,family,confirmed
លី សុភាព,Ly Sopheap,លោក,friend,pending
មាស សំផី,Meach Samphy,លោកជំទាវ,vip,sent
អាច ឈនៃ,Ach Chenay,អ្នកនាង,colleague,pending
```

## ❌ Common Issues & Solutions

### Issue: "CSV format not supported"
- Make sure your file ends with `.csv` extension
- Open in Excel and re-save as CSV
- Check for special characters in filenames

### Issue: "Some guests failed to import"
- Check the error message - usually missing Khmer name
- Verify required fields are present
- Try importing in smaller batches

### Issue: "Unauthorized" message
- Click "Logout" then "Admin" again
- Clear browser cookies if problem persists
- Try a different login method

### Issue: "Guest added but not showing"
- Refresh the page
- Check the "Recently Added" panel
- If using demo user, changes are temporary

## 🔐 Security Notes

✅ **Safe:**
- Your password is never stored locally
- Authentication happens through Google/GitHub
- All data is validated server-side

⚠️ **Remember:**
- Don't share your login credentials
- Logout when using shared computers
- Check who has admin access

## 📞 Keyboard Shortcuts

- `Cmd/Ctrl + S` - Can't save directly (use Add/Import buttons)
- Tab through form fields for faster input
- Enter submits single guest form

## 💡 Pro Tips

1. **Batch Operations**: Import 100+ guests at once with CSV
2. **Add Later**: Add VIP guests individually after bulk import
3. **Relationship Types**: Use consistently for better organization
4. **Status Tracking**: Update status field as you get RSVPs
5. **English Names**: Always include for better readability

## 📱 Device Support

- ✅ Desktop (Recommended)
- ✅ Tablet (Good)
- ✅ Mobile (Basic support, not recommended for CSV import)

## 🎨 Interface Guide

### Color Coding
- **Purple/Pink** - Add single guest
- **Emerald/Teal** - Bulk import
- **Blue** - Info boxes
- **Green** - Success messages
- **Red** - Error messages

### Buttons
- **Primary Button** - Main action (Add/Import)
- **Secondary Button** - Secondary options
- **Danger Button** - Logout/Delete

## 📧 Next Steps

After managing guests:
1. ✓ Added all guests
2. ✓ Organized by relationship type
3. ✓ Set initial status
4. → Send invitations
5. → Track RSVPs
6. → Plan seating

---

**Need Help?** Check the full documentation in `OAUTH_GUEST_MANAGEMENT.md`
