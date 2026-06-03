const fs = require('fs');
const content = fs.readFileSync('app/api/guests/route.ts', 'utf8');

let newContent = content.replace(
  /    if \(\!isSuperAdmin\(user\)\) \{\n      query = query\.eq\("created_by_user_id", user\.id\);\n    \}/,
  `    let allowedEventIds: string[] = [];
    const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";
    
    if (!isSuperAdmin(user)) {
      const { data: userEvents, error: eventsError } = await supabaseAdmin
        .from(EVENTS_TABLE)
        .select("id")
        .eq("owner_user_id", user.id);
        
      if (eventsError) throw new Error(eventsError.message);
      
      allowedEventIds = (userEvents ?? []).map(e => e.id);
      
      if (allowedEventIds.length === 0) {
        return NextResponse.json({ guests: [] });
      }
      query = query.in("event_id", allowedEventIds);
    }`
);

newContent = newContent.replace(
  /    \/\/ Non-super-admins can only delete their own guests\n    if \(\!isSuperAdmin\(user\)\) \{[\s\S]*?if \(guestData\.created_by_user_id \!\=\= user\.id\) \{\n        return NextResponse\.json\(\{ error: "Forbidden: You don't own this guest"/g,
  `    // Non-super-admins can only delete guests in events they own
    const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";
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
        return NextResponse.json({ error: "Forbidden: You don't own the event for this guest"`
);

fs.writeFileSync('app/api/guests/route.ts', newContent);
