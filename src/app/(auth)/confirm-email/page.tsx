
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, Suspense } from 'react';
import { confirmEmailAndLogin } from '@/lib/actions';

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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
        </>
      ) : (
        'Verify Email & Login'
      )}
    </Button>
  );
}

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [state, formAction] = useActionState(confirmEmailAndLogin, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && !state.success) {
      console.log(`[ConfirmEmailPage] Confirmation failure state received: ${state.message}`);
      toast({
        title: 'Verification Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="space-y-4">
        <Link href="/" className="flex justify-center">
          <Logo />
        </Link>
        <div className="text-center">
          <CardTitle className="text-2xl font-headline">
            Confirm Your Email
          </CardTitle>
          <CardDescription>
            We sent a 6-digit code to <strong>{email || 'your email'}</strong>. Please
            enter it below to activate your account.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="email" value={email || ''} />
          <div className="grid gap-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              name="code"
              placeholder="123456"
              maxLength={6}
              required
              className="text-center text-lg tracking-widest"
            />
          </div>
          <SubmitButton />
        </form>
        <div className="mt-4 text-center text-sm">
          Didn&apos;t get a code?{' '}
          <Link href="#" className="underline">
            Resend
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ConfirmEmailPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Suspense fallback={<div>Loading...</div>}>
                <ConfirmEmailContent />
            </Suspense>
        </div>
    );
}
