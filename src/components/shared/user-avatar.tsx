import { cn } from "@/lib/utils";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

const SIZE_CLASSES = {
  sm: "size-8 text-xs",
  default: "size-9 text-sm",
  lg: "size-12 text-base",
  xl: "size-20 text-2xl",
} as const;

export function UserAvatar({
  name,
  email,
  size = "default",
  className,
}: {
  name?: string | null;
  email?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[#111827] font-semibold text-white",
        SIZE_CLASSES[size],
        className
      )}
    >
      {getInitials(name, email)}
    </div>
  );
}
