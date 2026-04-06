const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#ec4899", "#f43f5e", "#14b8a6", "#6366f1",
];

export const AVATAR_COLORS = COLORS;

export const AVATAR_EMOJIS = [
  "😎", "🦁", "🌟", "👻", "🔥", "🐱", "🦊", "🐻",
  "🐸", "🦄", "🐙", "🎃", "💀", "🤖", "👽", "🎯",
  "⚡", "🌈", "🍕", "🎸", "🏀", "🎮", "🚀", "💎",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export interface AvatarData {
  avatar_type?: string;
  avatar_emoji?: string | null;
  avatar_color?: string | null;
  avatar_url?: string | null;
}

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  avatarData?: AvatarData;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-20 h-20 text-3xl",
};

export default function Avatar({ name, size = "md", avatarData }: AvatarProps) {
  // Image avatar
  if (avatarData?.avatar_type === "image" && avatarData.avatar_url) {
    return (
      <img
        src={avatarData.avatar_url}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover shrink-0`}
      />
    );
  }

  // Emoji avatar
  if (avatarData?.avatar_type === "emoji" && avatarData.avatar_emoji) {
    return (
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center shrink-0`}
        style={{ backgroundColor: avatarData.avatar_color || getColor(name) }}
      >
        {avatarData.avatar_emoji}
      </div>
    );
  }

  // Default: initials
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: getColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}

interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: "sm" | "md" | "lg";
  avatarMap?: Record<string, AvatarData>;
}

export function AvatarGroup({ names, max = 4, size = "md", avatarMap }: AvatarGroupProps) {
  const shown = names.slice(0, max);
  const extra = names.length - max;

  return (
    <div className="flex -space-x-2">
      {shown.map((name) => (
        <div key={name} className="ring-2 ring-card rounded-full">
          <Avatar name={name} size={size} avatarData={avatarMap?.[name]} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className={`${sizes[size]} rounded-full flex items-center justify-center bg-muted text-white font-bold ring-2 ring-card`}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
