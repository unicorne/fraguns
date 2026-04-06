"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/storage";
import Avatar, { AvatarData } from "@/components/Avatar";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImage } from "@/lib/crop-image";

export default function ProfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<{
    userId: string;
    username: string;
  } | null>(null);
  const [avatarData, setAvatarData] = useState<AvatarData>({});
  const [uploading, setUploading] = useState(false);

  // Cropper state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.push("/");
      return;
    }
    setUser(stored);
    fetch(`/api/users?username=${encodeURIComponent(stored.username)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setAvatarData({
            avatar_type: data.user.avatar_type,
            avatar_url: data.user.avatar_url,
          });
        }
      });
  }, []);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCropSave() {
    if (!user || !imageSrc || !croppedArea) return;
    setUploading(true);

    try {
      const blob = await getCroppedImage(imageSrc, croppedArea);
      const form = new FormData();
      form.set("user_id", user.userId);
      form.set("avatar_type", "image");
      form.set("file", new File([blob], "avatar.jpg", { type: "image/jpeg" }));

      const res = await fetch("/api/users/avatar", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        setAvatarData(data);
      }
    } finally {
      setUploading(false);
      setImageSrc(null);
    }
  }

  async function handleRemove() {
    if (!user) return;
    const form = new FormData();
    form.set("user_id", user.userId);
    form.set("avatar_type", "initials");
    const res = await fetch("/api/users/avatar", { method: "POST", body: form });
    if (res.ok) {
      setAvatarData({ avatar_type: "initials" });
    }
  }

  if (!user) return null;

  // Cropper overlay
  if (imageSrc) {
    return (
      <div className="flex flex-col flex-1 min-h-screen bg-black">
        <div className="relative flex-1">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="bg-black px-6 py-4 flex gap-3">
          <button
            onClick={() => setImageSrc(null)}
            className="flex-1 h-11 rounded-2xl bg-white/10 text-white font-semibold"
          >
            Abbrechen
          </button>
          <button
            onClick={handleCropSave}
            disabled={uploading}
            className="flex-1 h-11 rounded-2xl bg-accent text-white font-semibold disabled:opacity-50"
          >
            {uploading ? "Speichern..." : "Speichern"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <div className="bg-gradient-to-b from-accent to-accent-light px-6 pt-8 pb-16 text-center">
        <button
          onClick={() => router.push("/")}
          className="text-white text-base font-semibold mb-4 hover:text-white/80 self-start block"
        >
          &larr; Zurück
        </button>
        <div className="flex justify-center mb-3">
          <Avatar name={user.username} size="xl" avatarData={avatarData} />
        </div>
        <h1 className="text-xl font-bold text-white">@{user.username}</h1>
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-11 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-dark"
          >
            Foto auswählen
          </button>

          {avatarData.avatar_type === "image" && (
            <button
              onClick={handleRemove}
              className="w-full h-11 rounded-2xl bg-background border border-card-border text-muted font-semibold hover:border-accent"
            >
              Profilbild entfernen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
