
'use client';
import { ReviewForm } from '@/components/landing/review-form';
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Business } from '@/lib/types';
import { getBusiness } from '@/lib/actions';


export default function ReviewPage() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get('bid');
  const [business, setBusiness] = useState<Business | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(businessId) {
      getBusiness(businessId).then(biz => {
        setBusiness(biz);
        setLoading(false);
      });
    } else {
      setBusiness(null);
      setLoading(false);
    }
  }, [businessId]);

  const renderContent = () => {
    if (loading) {
        return <Card className="w-full max-w-2xl shadow-2xl"><CardContent className="p-8">Loading...</CardContent></Card>
    }

    if (!business) {
        // This handles both invalid ID and no ID cases
        return <ReviewForm businessId={null} />;
    }

    if (business.status !== 'active') {
        return (
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center">
                        <AlertTriangle className="size-12 text-destructive mb-4" />
                    </div>
                    <CardTitle className="text-2xl font-headline">Unable to Leave Feedback</CardTitle>
                    <CardDescription>
                        This business is not currently accepting new reviews through our platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">
                        If you'd like to share your feedback, please contact {business.name} directly. We apologize for any inconvenience.
                    </p>
                </CardContent>
            </Card>
        )
    }

    // Business is active, show the form
    return (
        <div className="w-full max-w-2xl">
            {business?.logoUrl && (
                <div className="flex justify-center mb-8">
                    <Image src={business.logoUrl} alt={`${business.name} Logo`} width={100} height={100} className="rounded-full object-contain"/>
                </div>
            )}
            <ReviewForm businessId={businessId} businessName={business?.name} />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
        <header className="px-4 lg:px-6 h-16 flex items-center bg-card/80 backdrop-blur-sm sticky top-0 z-50 border-b">
            <Link href="/" className="flex items-center justify-center">
                <Logo />
                <span className="sr-only">Review Router</span>
            </Link>
        </header>
      <main className="flex-1 flex items-center justify-center py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 flex justify-center">
          {renderContent()}
        </div>
      </main>
      <footer className="flex items-center justify-center w-full h-24 border-t bg-card">
        <p className="text-muted-foreground">© 2024 Review Router. All rights reserved.</p>
      </footer>
    </div>
  );
}
