"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, storeUser } from "@/lib/storage";
import Avatar, {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  AvatarData,
} from "@/components/Avatar";

type Tab = "emoji" | "image";

export default function ProfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<{
    userId: string;
    username: string;
  } | null>(null);
  const [avatarData, setAvatarData] = useState<AvatarData>({});
  const [tab, setTab] = useState<Tab>("emoji");
  const [selectedEmoji, setSelectedEmoji] = useState("😎");
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.push("/");
      return;
    }
    setUser(stored);
    // Fetch current avatar
    fetch(`/api/users?username=${encodeURIComponent(stored.username)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setAvatarData({
            avatar_type: data.user.avatar_type,
            avatar_emoji: data.user.avatar_emoji,
            avatar_color: data.user.avatar_color,
            avatar_url: data.user.avatar_url,
          });
          if (data.user.avatar_emoji) setSelectedEmoji(data.user.avatar_emoji);
          if (data.user.avatar_color) setSelectedColor(data.user.avatar_color);
        }
      });
  }, []);

  async function saveEmoji() {
    if (!user) return;
    setSaving(true);
    const form = new FormData();
    form.set("user_id", user.userId);
    form.set("avatar_type", "emoji");
    form.set("avatar_emoji", selectedEmoji);
    form.set("avatar_color", selectedColor);

    const res = await fetch("/api/users/avatar", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setAvatarData(data);
    }
    setSaving(false);
  }

  async function uploadImage(file: File) {
    if (!user) return;
    setUploading(true);
    const form = new FormData();
    form.set("user_id", user.userId);
    form.set("avatar_type", "image");
    form.set("file", file);

    const res = await fetch("/api/users/avatar", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setAvatarData(data);
    }
    setUploading(false);
  }

  if (!user) return null;

  // Preview based on current tab selection
  const previewData: AvatarData =
    tab === "emoji"
      ? { avatar_type: "emoji", avatar_emoji: selectedEmoji, avatar_color: selectedColor }
      : avatarData;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-8 pb-16 text-center">
        <button
          onClick={() => router.push("/")}
          className="text-white/70 text-sm mb-4 hover:text-white self-start block"
        >
          &larr; Zurück
        </button>
        <div className="flex justify-center mb-3">
          <Avatar name={user.username} size="xl" avatarData={previewData} />
        </div>
        <h1 className="text-xl font-bold text-white">@{user.username}</h1>
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm">
          {/* Tab selector */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setTab("emoji")}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold border ${
                tab === "emoji"
                  ? "bg-accent text-white border-accent"
                  : "bg-background border-card-border text-muted"
              }`}
            >
              Emoji
            </button>
            <button
              onClick={() => setTab("image")}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold border ${
                tab === "image"
                  ? "bg-accent text-white border-accent"
                  : "bg-background border-card-border text-muted"
              }`}
            >
              Foto hochladen
            </button>
          </div>

          {tab === "emoji" && (
            <>
              {/* Emoji picker */}
              <p className="text-xs text-muted mb-2">Emoji wählen</p>
              <div className="grid grid-cols-8 gap-2 mb-4">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      selectedEmoji === emoji
                        ? "bg-accent/20 ring-2 ring-accent"
                        : "bg-background"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <p className="text-xs text-muted mb-2">Hintergrundfarbe</p>
              <div className="grid grid-cols-6 gap-2 mb-5">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full ${
                      selectedColor === color ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <button
                onClick={saveEmoji}
                disabled={saving}
                className="w-full h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
              >
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </>
          )}

          {tab === "image" && (
            <>
              <div className="flex flex-col items-center gap-4">
                {avatarData.avatar_type === "image" && avatarData.avatar_url && (
                  <img
                    src={avatarData.avatar_url}
                    alt="Aktuelles Profilbild"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark disabled:opacity-50"
                >
                  {uploading ? "Hochladen..." : "Foto auswählen"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
