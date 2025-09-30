import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <Link href="/" className="flex items-center justify-center">
        <Logo />
        <span className="sr-only">Review Router</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Button asChild variant="ghost">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </nav>
    </header>
  );
}
