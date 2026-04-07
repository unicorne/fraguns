export default function LoadingSpinner({ text = "Laden" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-[3px] border-card-border" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-accent animate-spin" />
      </div>
      {text && <p className="text-sm text-muted animate-pulse">{text}</p>}
    </div>
  );
}

export function FullPageSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center min-h-screen">
      <LoadingSpinner text={text} />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-card-border p-5 shadow-sm animate-pulse">
      <div className="h-3 bg-card-border rounded-full w-1/3 mx-auto mb-5" />
      <div className="flex flex-col gap-2.5">
        <div className="h-12 bg-card-border/50 rounded-2xl" />
        <div className="h-12 bg-card-border/50 rounded-2xl" />
        <div className="h-12 bg-card-border/50 rounded-2xl" />
      </div>
    </div>
  );
}
