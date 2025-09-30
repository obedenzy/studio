import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
        <svg
            className="size-8 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M4 12h16M4 12l6-6m-6 6l6 6"/>
            <path d="M20 12l-6-6m6 6l-6 6"/>
        </svg>
      <span className="font-headline text-xl font-bold">Review Router</span>
    </div>
  );
}
