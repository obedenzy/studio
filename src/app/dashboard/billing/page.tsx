
'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getSubscriptionStatus, getPaymentHistory, getBusiness, getCurrentUser } from '@/lib/actions';
import { BillingContent } from '@/components/dashboard/billing-content';
import type { Business, TeamUser } from '@/lib/types';
import type { FormattedInvoice } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';


export default function BillingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [subscriptionData, setSubscriptionData] = useState<any>(null);
    const [paymentHistory, setPaymentHistory] = useState<FormattedInvoice[]>([]);
    const [business, setBusiness] = useState<Business | null>(null);
    const [user, setUser] = useState<TeamUser | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (isSuccessRedirect = false) => {
        setLoading(true);
        const currentUser = await getCurrentUser();
        
        if (currentUser && currentUser.businessId) {
            setUser(currentUser);
            const [bizData, subData, payHistoryData] = await Promise.all([
                getBusiness(currentUser.businessId),
                getSubscriptionStatus(currentUser.businessId),
                getPaymentHistory(currentUser.businessId),
            ]);

            setBusiness(bizData);
            setSubscriptionData(subData);
            setPaymentHistory(payHistoryData.invoices || []);

            if (isSuccessRedirect) {
                 toast({
                    title: 'Payment Successful!',
                    description: `Subscription activated for Business ID: ${currentUser.businessId}`,
                    variant: 'default',
                });
            }

        } else {
            // Handle case where user or business data could not be fetched
            setBusiness(null);
            setUser(null);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');

        if (success) {
            fetchData(true); 
            router.replace('/dashboard/billing', { scroll: false });
        } else if (canceled) {
            toast({
                title: 'Checkout Canceled',
                description: "You have not been charged.",
                variant: 'destructive',
            });
            router.replace('/dashboard/billing', { scroll: false });
        } else {
            fetchData();
        }

    }, [searchParams, router, fetchData]);


    if (loading) {
        return (
          <Card>
            <CardHeader><CardTitle>Loading Billing Information...</CardTitle></CardHeader>
            <CardContent><p>Please wait while we fetch your billing details.</p></CardContent>
          </Card>
        );
    }
    
    if (!business || !user) {
        return (
          <Card>
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent><p>Could not load billing information for your business.</p></CardContent>
          </Card>
        );
    }
    
    return (
        <Suspense fallback={<div>Loading subscription details...</div>}>
            <BillingContent 
                subscriptionData={subscriptionData}
                paymentHistory={paymentHistory}
                businessId={business.id}
                email={user.email}
            />
        </Suspense>
    )
}
