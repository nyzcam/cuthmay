const fs = require('fs');
let content = fs.readFileSync('app/api/guests/comment/route.ts', 'utf8');

content = content.replace(
  /    \/\/ Non-super-admins can only see comments for their own guests\n    if \(\!isSuperAdmin\(user\)\) \{\n      query = query\.eq\("guests\.created_by_user_id", user\.id\);\n    \}/g,
  `    const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";
    // Non-super-admins can only see comments for events they own
    if (!isSuperAdmin(user)) {
      const { data: userEvents } = await supabaseAdmin
        .from(EVENTS_TABLE)
        .select("id")
        .eq("owner_user_id", user.id);
        
      const allowedEventIds = (userEvents ?? []).map((e: any) => e.id);
      if (allowedEventIds.length === 0) {
        return NextResponse.json({ comments: [], hasMore: false });
      }
      query = query.in("event_id", allowedEventIds);
    }`
);

content = content.replace(
  /    \/\/ Non-super-admins can only (update|delete) comments for their own guests\n    if \(\!isSuperAdmin\(user\)\) \{[\s\S]*?if \(guestOwnerId \!\=\= user\.id\) \{\n        return NextResponse\.json\(\{ error: "Forbidden: You do not own the associated guest" \}, \{ status: 403 \}\);\n      \}\n    \}/g,
  `    const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";
    // Non-super-admins can only $1 comments for events they own
    if (!isSuperAdmin(user)) {
      const { data: eventData, error: eventError } = await supabaseAdmin
        .from(EVENTS_TABLE)
        .select("owner_user_id")
        .eq("id", eventId)
        .single();
        
      if (eventError || !eventData) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      
      if (eventData.owner_user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden: You do not own the event for this comment" }, { status: 403 });
      }
    }`
);

fs.writeFileSync('app/api/guests/comment/route.ts', content);
