
'use client';
import { useEffect, useState } from 'react';
import { getSubscriptionStatus, getReviewsForBusiness, getCurrentUser, getBusiness } from '@/lib/actions';
import type { Business, Review } from '@/lib/types';
import { DashboardClientContent } from '@/components/dashboard/dashboard-client-content';

export default function DashboardPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [business, setBusiness] = useState<Business | null | undefined>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const currentUser = await getCurrentUser();
      
      if (currentUser && currentUser.businessId) {
        setBusinessId(currentUser.businessId);
        const [subData, reviewsData, bizData] = await Promise.all([
            getSubscriptionStatus(currentUser.businessId),
            getReviewsForBusiness(currentUser.businessId),
            getBusiness(currentUser.businessId)
        ]);
        setSubscriptionData(subData);
        setBusiness(bizData); 
        setReviews(reviewsData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
      return <div>Loading dashboard...</div>;
  }
  
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
  
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating: `${rating} Star`,
      count: reviews.filter(r => r.rating === rating).length
  }));

  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const negativeReviews = reviews.filter(r => r.rating <= 2).length;

  const dashboardMetrics = {
      averageRating,
      totalReviews,
      ratingDistribution,
      positiveReviews,
      negativeReviews,
      positiveRedirects: business ? reviews.filter(r => r.rating >= business.redirect_threshold).length : 0,
  };


  return (
    <DashboardClientContent 
        subscriptionData={subscriptionData}
        business={business}
        reviews={reviews}
        dashboardMetrics={dashboardMetrics}
    />
  );
}
