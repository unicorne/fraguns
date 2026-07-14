import { COLORS, hashString } from "./Avatar";

const EMOJIS = [
  "🦄", "🐙", "🦖", "🐸", "🦊", "🐵", "🦁", "🐯",
  "🐨", "🐼", "🦉", "🦩", "🐳", "🦋", "🐺", "🦔",
  "🐹", "🦒", "🐢", "🦫", "🐧", "🦥", "🐝", "🦀",
  "🦦", "🦕", "🦭", "🐿️", "🦡", "🐰", "🦜", "🐷",
  "🐮", "🦧", "🦌", "🐴", "🦢", "🦚",
];

const sizes = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-xl",
  lg: "w-12 h-12 text-2xl",
  xl: "w-20 h-20 text-4xl",
};

interface GroupAvatarProps {
  groupId: string;
  size?: keyof typeof sizes;
}

export default function GroupAvatar({ groupId, size = "md" }: GroupAvatarProps) {
  const emojiIdx = hashString(groupId) % EMOJIS.length;
  const colorIdx = hashString(groupId + ":color") % COLORS.length;
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center shrink-0`}
      style={{ backgroundColor: COLORS[colorIdx] + "33" }}
    >
      {EMOJIS[emojiIdx]}
    </div>
  );
}
