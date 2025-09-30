
'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

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
import { signup } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const initialState = {
  success: false,
  message: '',
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
        </>
      ) : (
        'Create account'
      )}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message && !state.success) {
      toast({
        title: 'Signup Failed',
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
              Create an account
            </CardTitle>
            <CardDescription>
              Enter your information to create your business account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                name="businessName"
                placeholder="Acme Inc."
                required
              />
              {state.errors?.businessName && (
                <p className="text-sm text-destructive">{state.errors.businessName[0]}</p>
              )}
            </div>
             <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                placeholder="John Doe" 
                required 
              />
              {state.errors?.fullName && (
                <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive">{state.errors.email[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              {state.errors?.password && (
                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
              {state.errors?.confirmPassword && (
                <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
              )}
            </div>
            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
