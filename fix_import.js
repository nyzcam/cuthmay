const fs = require('fs');
let content = fs.readFileSync('app/api/guests/import/route.ts', 'utf8');

if (!content.includes('// Check if event exists and user has permission')) {
  // We need to inject event permission validation into POST
  const newCheck = `
    const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";
    
    // Check if event exists and user has permission
    if (!isSuperAdmin(adminUser)) {
      const { data: eventData, error: eventError } = await supabaseAdmin
        .from(EVENTS_TABLE)
        .select("owner_user_id")
        .eq("id", eventId)
        .single();
        
      if (eventError || !eventData) {
        return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
      }
      
      if (eventData.owner_user_id !== adminUser.id) {
        return NextResponse.json({ success: false, message: "Forbidden: You do not own this event" }, { status: 403 });
      }
    }
`;

  content = content.replace(
    /    if \(\!eventId\) \{\n      return NextResponse\.json\(\{\n        success: false,\n        message: 'Event ID is required',\n      \}, \{ status: 400 \}\);\n    \}/,
    `    if (!eventId) {\n      return NextResponse.json({\n        success: false,\n        message: 'Event ID is required',\n      }, { status: 400 });\n    }\n${newCheck}`
  );
  
  // also inject `isSuperAdmin` to session import
  content = content.replace(
    /  canAccessGuestManagement,\n  getAuthenticatedRequestUser,/,
    `  canAccessGuestManagement,\n  getAuthenticatedRequestUser,\n  isSuperAdmin,`
  );
  fs.writeFileSync('app/api/guests/import/route.ts', content);
}
