import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// POST: Upload image or set emoji avatar
export async function POST(request: Request) {
  const formData = await request.formData();
  const userId = formData.get("user_id") as string;
  const avatarType = formData.get("avatar_type") as string;

  if (!userId || !avatarType) {
    return NextResponse.json({ error: "user_id und avatar_type fehlen" }, { status: 400 });
  }

  if (avatarType === "emoji") {
    const emoji = formData.get("avatar_emoji") as string;
    const color = formData.get("avatar_color") as string;

    const { error } = await supabaseAdmin
      .from("users")
      .update({ avatar_type: "emoji", avatar_emoji: emoji, avatar_color: color, avatar_url: null })
      .eq("id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ avatar_type: "emoji", avatar_emoji: emoji, avatar_color: color });
  }

  if (avatarType === "image") {
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Kein Bild hochgeladen" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(path);

    const avatarUrl = urlData.publicUrl;

    const { error } = await supabaseAdmin
      .from("users")
      .update({ avatar_type: "image", avatar_url: avatarUrl, avatar_emoji: null, avatar_color: null })
      .eq("id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ avatar_type: "image", avatar_url: avatarUrl });
  }

  // Reset to initials
  const { error } = await supabaseAdmin
    .from("users")
    .update({ avatar_type: "initials", avatar_emoji: null, avatar_color: null, avatar_url: null })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ avatar_type: "initials" });
}
