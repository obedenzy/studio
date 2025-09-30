
'use client';

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import { login } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";


const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
        </>
      ) : (
        'Login'
      )}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      console.log('[LoginPage] Login successful, redirecting to /dashboard...');
      router.push('/dashboard');
    }
    if (state?.message && !state.success) {
      console.log(`[LoginPage] Login failure state received: ${state.message}`);
      toast({
        title: 'Login Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-4">
          <Link href="/" className="flex justify-center">
            <Logo />
          </Link>
          <div className="text-center">
            <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
