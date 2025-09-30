
import Link from 'next/link';

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

export default function SuperAdminSignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-4">
          <Link href="/" className="flex justify-center">
            <Logo />
          </Link>
          <div className="text-center">
            <CardTitle className="text-2xl font-headline">
              Super Admin Registration
            </CardTitle>
            <CardDescription>
              Create the primary super administrator account.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
             <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                placeholder="Admin User" 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="superadmin@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild>
                <Link href="/superadmin/dashboard">Create Super Admin</Link>
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/superadmin/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
