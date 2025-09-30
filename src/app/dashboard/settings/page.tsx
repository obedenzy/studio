
'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState, useRef } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';

import { updateSettings, getBusiness, getCurrentUser } from '@/lib/actions';
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
import { Loader2, Upload } from 'lucide-react';
import type { Business, TeamUser } from '@/lib/types';


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

const settingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required.'),
  contactEmail: z.string().email('Please enter a valid email.'),
});

export default function SettingsPage() {
  const [state, formAction] = useActionState(updateSettings, {
    success: false,
    message: '',
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [user, setUser] = useState<TeamUser | null>(null);
  const [logoToSave, setLogoToSave] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.businessId) {
            setUser(currentUser);
            const biz = await getBusiness(currentUser.businessId);
            if (biz) {
                setBusiness(biz);
                if (biz?.logoUrl) {
                    setLogoPreview(biz.logoUrl);
                }
            }
        }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && business?.id) {
        getBusiness(business.id).then(biz => {
            if (biz) setBusiness(biz);
        });
      }
    }
  }, [state, toast, business?.id]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setLogoToSave(result); // Store the base64 string to be saved
        toast({
            title: 'Logo Preview Updated',
            description: 'Click "Save Changes" to apply the new logo.'
        });
      };
      reader.readAsDataURL(file);
    }
  };


  if (!business || !user) {
    return <p>Loading business settings...</p>;
  }

  return (
    <div className="space-y-8">
      <form action={formAction}>
        <input type="hidden" name="businessId" value={business.id} />
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Business Information
            </CardTitle>
            <CardDescription>
              Update your business details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                name="businessName"
                defaultValue={business.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                defaultValue={user.email}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>

      <form action={formAction}>
        <input type="hidden" name="businessId" value={business.id} />
        {logoToSave && <input type="hidden" name="logoUrl" value={logoToSave} />}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Business Branding</CardTitle>
            <CardDescription>Upload your company logo to be displayed on the review form.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label>Business Logo</Label>
                <div className="flex items-center gap-6">
                    <div className="relative h-20 w-20 rounded-md border flex items-center justify-center bg-muted/50">
                        {logoPreview ? (
                            <Image src={logoPreview} alt="Business Logo Preview" layout="fill" objectFit="contain" className="rounded-md" />
                        ) : (
                           <span className="text-xs text-muted-foreground">Logo</span>
                        )}
                    </div>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleFileChange}
                    />
                </div>
                 <p className="text-sm text-muted-foreground pt-2">Recommended size: 256x256px. PNG, JPG or GIF.</p>
             </div>
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Account Security
          </CardTitle>
          <CardDescription>
            Manage your account security and password settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
              For security reasons, password changes can be done through your profile page.
          </p>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/profile">
              Go to Profile
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
