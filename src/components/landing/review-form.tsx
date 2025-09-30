
"use client";

import { useState, useTransition, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { submitReview, getBusiness } from "@/lib/actions";

import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, Star } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import type { Business } from "@/lib/types";

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
        </>
      ) : (
        "Submit Feedback"
      )}
    </Button>
  );
}

export function ReviewForm({ businessId, businessName }: { businessId: string | null, businessName?: string }) {
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [state, formAction] = useActionState(submitReview, initialState);
  const [business, setBusiness] = useState<Business | null>(null);
  
  useEffect(() => {
    if(businessId) {
        getBusiness(businessId).then(biz => {
            if (biz) {
                setBusiness(biz);
            }
        });
    }
  }, [businessId]);

  const handleRatingSelect = (newRating: number) => {
    setRating(newRating);
    startTransition(() => {
      if (business && newRating >= business.redirect_threshold) {
        if (typeof window !== 'undefined' && business.google_review_url) {
          window.location.href = business.google_review_url;
        }
      } else {
        setStep(3); // Go to internal feedback form
      }
    });
  };

  useEffect(() => {
    if (state.success) {
      setStep(5); // Show success message
    }
  }, [state.success]);

  if (!businessId) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                This review link is invalid. Please check the URL and try again.
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <Card className="w-full shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <div>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline">
                  How was your experience with {businessName || 'us'}?
                </CardTitle>
                <CardDescription>
                  Your feedback helps us improve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StarRating
                  value={rating}
                  onChange={handleRatingSelect}
                  className="justify-center"
                  size={40}
                />
              </CardContent>
            </div>
          )}

          {step === 3 && (
            <form action={formAction}>
              <CardHeader>
                <CardTitle className="text-3xl font-headline">
                  Share Your Feedback
                </CardTitle>
                <CardDescription>
                  We're sorry your experience wasn't perfect. Please let us know
                  what we can do better.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input type="hidden" name="businessId" value={businessId} />
                <div className="flex items-center gap-4">
                    <Label>Your Rating:</Label>
                    <StarRating value={rating} onChange={setRating} size={24}/>
                    <input type="hidden" name="rating" value={rating} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Your Name (Optional)</Label>
                  <Input id="customerName" name="customerName" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email (Optional)</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Your Feedback</Label>
                  <Textarea
                    id="comment"
                    name="comment"
                    placeholder="Tell us about your experience..."
                    rows={5}
                    required
                  />
                   {state?.errors?.comment && <p className="text-sm text-destructive">{state.errors.comment[0]}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <SubmitButton />
                {state?.message && !state.success && (
                    <p className="text-sm text-destructive">{state.message}</p>
                )}
              </CardFooter>
            </form>
          )}

          {step === 5 && (
            <div>
                 <CardHeader className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <CardTitle className="text-2xl font-headline">Feedback Sent!</CardTitle>
                    <CardDescription>
                        {state.message || "Thank you for your feedback. We'll use it to improve our service."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => { setRating(0); setStep(1); }} className="w-full">
                        Leave Another Review
                    </Button>
                </CardContent>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
