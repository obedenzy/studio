
'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';
import { forgotPassword } from '@/lib/actions';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  success: false,
  message: '',
  email: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
        </>
      ) : (
        'Send Reset Code'
      )}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPassword, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  if (state.success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-headline">
              Check Your Email
            </CardTitle>
            <CardDescription>{state.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href={`/reset-password?email=${encodeURIComponent(state.email || '')}`}>
                Proceed to Reset Password
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-4">
          <Link href="/" className="flex justify-center">
            <Logo />
          </Link>
          <div className="text-center">
            <CardTitle className="text-2xl font-headline">
              Forgot Your Password?
            </CardTitle>
            <CardDescription>
              No problem. Enter your email below and we&apos;ll send you a
              6-digit code to reset it.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Remember your password?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
