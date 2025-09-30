
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Rocket, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession, createCustomerPortalSession } from '@/lib/actions';
import type { getSubscriptionStatus, FormattedInvoice } from '@/lib/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

// Load Stripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface BillingContentProps {
  subscriptionData: Awaited<ReturnType<typeof getSubscriptionStatus>>;
  paymentHistory: FormattedInvoice[];
  businessId: string;
  email: string;
}

export function BillingContent({ subscriptionData, paymentHistory = [], businessId, email }: BillingContentProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isPortalRedirecting, setIsPortalRedirecting] = useState(false);

  useEffect(() => {
    if (searchParams.get('success')) {
      // This is handled by the page now to ensure fresh data is passed down.
      // The toast is also moved to the page level.
      router.replace('/dashboard/billing', { scroll: false });
    }

    if (searchParams.get('canceled')) {
      toast({
        title: 'Checkout Canceled',
        description: "You have not been charged.",
        variant: 'destructive',
      });
       // Clean up the URL
       router.replace('/dashboard/billing', { scroll: false });
    }
  }, [searchParams, toast, router]);


  const handleSubscriptionAction = async () => {
    setIsRedirecting(true);
    
    const { sessionId, error } = await createCheckoutSession(businessId, email);

    if (error) {
        toast({
            title: "Error",
            description: error,
            variant: "destructive",
        });
        setIsRedirecting(false);
        return;
    }

    if (sessionId) {
        toast({
            title: 'Redirecting to Stripe...',
            description: `A checkout session has been created for Business ID: ${businessId}`,
        });
        const stripe = await stripePromise;
        const result = await stripe?.redirectToCheckout({ sessionId });
        if (result?.error) {
            toast({
                title: "Error",
                description: result.error.message,
                variant: "destructive",
            });
            setIsRedirecting(false);
        }
    }
  };

  const handlePortalAction = async () => {
    setIsPortalRedirecting(true);

    const { url, error } = await createCustomerPortalSession(businessId);

    if (error) {
        toast({
            title: "Error",
            description: error,
            variant: "destructive",
        });
        setIsPortalRedirecting(false);
        return;
    }

    if (url) {
        window.location.href = url;
    }
  };

  const { status, amount, renewsAt, planName } = subscriptionData;
  const isSubscribed = status === 'active';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Subscription</CardTitle>
          <CardDescription>
            Manage your subscription and view your payment history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">{isSubscribed ? planName : 'No Active Plan'}</h3>
              <p className="text-sm text-muted-foreground">
                {isSubscribed && renewsAt ? `$${amount}/month. Renews on ${format(renewsAt, 'PPP')}` : 'Subscription is inactive.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isSubscribed ? 'secondary' : 'destructive'}>
                {status}
              </Badge>
            </div>
          </div>

          {!isSubscribed && !searchParams.get('success') && (
             <Alert>
                <Rocket className="h-4 w-4" />
                <AlertTitle>Your Subscription is Inactive!</AlertTitle>
                <AlertDescription>
                    Activate your subscription to continue using our services and unlock premium features.
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-2 items-center justify-end border-t pt-6">
            {isSubscribed ? (
                <Button variant="outline" onClick={handlePortalAction} disabled={isPortalRedirecting}>
                  {isPortalRedirecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Manage Subscription
                </Button>
            ) : (
                <Button onClick={handleSubscriptionAction} disabled={isRedirecting}>
                  {isRedirecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Activate Subscription
                </Button>
            )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            The card that will be charged for your subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="32" viewBox="0 0 48 32"><path fill="#3F6FBF" d="M38.8 3.2h-29.6c-2.6 0-4.8 2.2-4.8 4.8v16c0 2.6 2.2 4.8 4.8 4.8h29.6c2.6 0 4.8-2.2 4.8-4.8v-16c0-2.6-2.2-4.8-4.8-4.8z"></path><path fill="#F2B249" d="M19.6 19.3c-2.3-3.2-3.1-6.2-3.3-6.6-1-3.2 2.3-5.5 2.3-5.5s-3.2 2.2-2.3 5.4c.2.3 1 3.4 3.3 6.7z"></path><path fill="#D94F3D" d="M30.4 19.3c-2.2-3.2-3-6.2-3.3-6.6-1-3.2 2.3-5.5 2.3-5.5s-3.2 2.2-2.3 5.4c.2.3 1 3.4 3.3 6.7z"></path><path fill="#F27B49" d="M25 18.2c-.7.9-1.5 1.7-2.3 2.5-1.5 1.2-2.8 1.4-3.3.6-.6-1 .2-2 .2-2 .1 0 .2-.2.3-.3.8-.9 1.6-1.9 2.1-2.9.5-1.1.7-2.2.7-3.3 0-.5-.1-1-.2-1.5-.2-1.1.1-1.7.2-1.8.6-.2 1.3.4 2.3 1.9s1.6 3.2 1.6 3.2-.2-1.9-1.6-3.2c-1-1.4-1.8-1.9-2.4-1.8-.1.1-.4.7-.2 1.8.1.5.2 1 .2 1.5 0 1.2-.3 2.3-.7 3.4-.6 1-1.3 2-2.2 2.9-.1.1-.2.2-.3.3-.1.1-.8 1.1 0 2.1.5.8 1.7.7 3.2-.5.8-.8 1.5-1.6 2.3-2.5z"></path></svg>
                    <div>
                        <p className="font-semibold">Manage in Stripe</p>
                        <p className="text-sm text-muted-foreground">Update your card via Stripe Portal</p>
                    </div>
                </div>
                <Button variant="outline" onClick={handlePortalAction} disabled={isPortalRedirecting || !isSubscribed}>
                    {isPortalRedirecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Payment Method
                </Button>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            A record of all your subscription payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.length > 0 ? paymentHistory.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{format(invoice.date, 'PPP')}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === 'paid'
                          ? 'secondary'
                          : invoice.status === 'open' || invoice.status === 'draft'
                          ? 'outline'
                          : 'destructive'
                      }
                      className="capitalize"
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.url ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={invoice.url} target="_blank">
                           View Invoice <ExternalLink className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No payment history found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}