
'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

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
import { resetPassword } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  success: false,
  message: '',
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...
        </>
      ) : (
        'Reset Password'
      )}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(resetPassword, initialState);
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-4">
          <Link href="/" className="flex justify-center">
            <Logo />
          </Link>
          <div className="text-center">
            <CardTitle className="text-2xl font-headline">
              Reset Your Password
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your email and create a new
              password.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <input type="hidden" name="email" value={email || ''} />
            <div className="grid gap-2">
              <Label htmlFor="code">Reset Code</Label>
              <Input
                id="code"
                name="code"
                placeholder="123456"
                maxLength={6}
                required
              />
              {state.errors?.code && (
                <p className="text-sm text-destructive">{state.errors.code[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
               {state.errors?.password && (
                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
              {state.errors?.confirmPassword && (
                <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
              )}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
