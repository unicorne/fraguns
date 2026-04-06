import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const userId = formData.get("user_id") as string;
  const avatarType = formData.get("avatar_type") as string;

  if (!userId || !avatarType) {
    return NextResponse.json({ error: "user_id und avatar_type fehlen" }, { status: 400 });
  }

  if (avatarType === "image") {
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Kein Bild hochgeladen" }, { status: 400 });
    }

    const path = `${userId}.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(path);

    // Add cache-buster to URL so browsers pick up new images
    const avatarUrl = `${urlData.publicUrl}?v=${Date.now()}`;

    const { error } = await supabaseAdmin
      .from("users")
      .update({ avatar_type: "image", avatar_url: avatarUrl })
      .eq("id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ avatar_type: "image", avatar_url: avatarUrl });
  }

  // Reset to initials
  const { error } = await supabaseAdmin
    .from("users")
    .update({ avatar_type: "initials", avatar_url: null })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ avatar_type: "initials" });
}
