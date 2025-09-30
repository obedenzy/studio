
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building, Users, Star, DollarSign } from 'lucide-react';
import type { Business, Review } from '@/lib/types';
import { getBusinesses, getAllReviews, getTeamUsers } from '@/lib/actions';


export default function SuperAdminDashboardPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [bizData, reviewData] = await Promise.all([
                getBusinesses(),
                getAllReviews()
            ]);
            setBusinesses(bizData);
            setReviews(reviewData);

            let userCount = 0;
            for(const biz of bizData) {
                const users = await getTeamUsers(biz.id);
                userCount += users.length;
            }
            setTotalUsers(userCount);

            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    const totalBusinesses = businesses.length;
    const activeBusinesses = businesses.filter(b => b.status === 'active').length;
    const totalSubscriptionRevenue = businesses.reduce((total, b) => {
        return b.status === 'active' ? total + b.subscriptionAmount : total;
    }, 0);
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) : 0;


  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalBusinesses}</div>
                    <p className="text-xs text-muted-foreground">All accounts, active and inactive.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Businesses</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeBusinesses}</div>
                     <p className="text-xs text-muted-foreground">Accounts with an active subscription.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalSubscriptionRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Estimated MRR from active accounts.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                     <p className="text-xs text-muted-foreground">Across all business accounts.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalReviews}</div>
                    <p className="text-xs text-muted-foreground">Captured across all businesses.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Platform Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{averageRating.toFixed(2)} / 5</div>
                    <p className="text-xs text-muted-foreground">Average internal rating.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
