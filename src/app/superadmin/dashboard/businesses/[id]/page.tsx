
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { ArrowLeft, DollarSign, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { getBusiness, getReviewsForBusiness } from '@/lib/actions';
import type { Business, Review } from '@/lib/types';

export default function BusinessDetailsPage({ params }: { params: { id: string } }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const [biz, bizReviews] = await Promise.all([
            getBusiness(params.id),
            getReviewsForBusiness(params.id)
        ]);
        if (biz) {
            setBusiness(biz);
            setReviews(bizReviews);
        }
        setLoading(false);
    }
    fetchData();
  }, [params.id]);

  if (loading) {
      return <div>Loading business details...</div>
  }

  if (!business) {
    notFound();
  }

  const businessTotalReviews = reviews.length;
  const businessAverageRating = businessTotalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / businessTotalReviews
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/superadmin/dashboard/businesses">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to businesses</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
        <Badge variant={business.status === 'active' ? 'secondary' : 'destructive'}>
          {business.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${business.subscriptionAmount.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <p className="text-xs text-muted-foreground">Renews on {format(new Date(business.renewsAt), 'PPP')}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{business.userCount}</div>
                <p className="text-xs text-muted-foreground">Team members in this account</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{businessTotalReviews}</div>
                <p className="text-xs text-muted-foreground">Reviews captured for this business</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{businessAverageRating.toFixed(1)} / 5</div>
                <p className="text-xs text-muted-foreground">Average internal rating</p>
            </CardContent>
        </Card>
      </div>

       <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Account Information</CardTitle>
                <CardDescription>Primary owner and account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-muted-foreground">Business ID</p>
                        <p className="font-mono bg-muted/50 px-2 py-1 rounded-md w-fit text-foreground">{business.id}</p>
                    </div>
                     <div>
                        <p className="font-medium text-muted-foreground">Owner Name</p>
                        <p>{business.ownerName}</p>
                    </div>
                     <div>
                        <p className="font-medium text-muted-foreground">Owner Email</p>
                        <p>{business.ownerEmail}</p>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-muted-foreground">Account Created</p>
                        <p>{format(new Date(business.createdAt), 'PPP')}</p>
                    </div>
                </div>
            </CardContent>
       </Card>

    </div>
  );
}
