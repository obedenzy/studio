
'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react';
import { updateProfile, changePassword, getCurrentUser } from '@/lib/actions';
import { mockUser } from '@/lib/placeholder-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { TeamUser } from '@/lib/types';


function SubmitButton({ text = 'Save Changes' }: { text?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
        </>
      ) : (
        text
      )}
    </Button>
  );
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<TeamUser | null>(null);
  
  const [profileState, profileAction] = useActionState(updateProfile, {
    success: false,
    message: '',
  });
  const [passwordState, passwordAction] = useActionState(changePassword, {
    success: false,
    message: '',
  });

  useEffect(() => {
    async function fetchUser() {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (profileState.message) {
      toast({
        title: profileState.success ? 'Success' : 'Error',
        description: profileState.message,
        variant: profileState.success ? 'default' : 'destructive',
      });
    }
  }, [profileState, toast]);

  useEffect(() => {
    if (passwordState.message) {
      toast({
        title: passwordState.success ? 'Success' : 'Error',
        description: passwordState.message,
        variant: passwordState.success ? 'default' : 'destructive',
      });
    }
  }, [passwordState, toast]);
  
  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <form action={profileAction}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Profile</CardTitle>
            <CardDescription>
              Manage your personal account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={user.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                readOnly
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>

      <form action={passwordAction}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password here. Make sure it's a strong one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <SubmitButton text="Update Password" />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
