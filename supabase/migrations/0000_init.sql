
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('Admin', 'Standard');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE public.user_status AS ENUM ('active', 'invited');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_status') THEN
        CREATE TYPE public.business_status AS ENUM ('active', 'inactive');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "public"."businesses" (
    "id" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "name" text NOT NULL,
    "owner_name" text NOT NULL,
    "owner_email" text NOT NULL,
    "status" public.business_status NOT NULL DEFAULT 'inactive',
    "subscription_amount" numeric NOT NULL,
    "renews_at" timestamp with time zone,
    "stripe_customer_id" text,
    "stripe_product_id" text,
    "stripe_price_id" text,
    "logo_url" text,
    "redirect_threshold" integer NOT NULL DEFAULT 4,
    "google_review_url" text
);

ALTER TABLE "public"."businesses" OWNER TO "postgres";
ALTER TABLE "public"."businesses" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "public"."businesses" ADD CONSTRAINT "businesses_pkey" PRIMARY KEY ("id");

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "business_id" text NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "password" text NOT NULL,
    "role" public.user_role NOT NULL,
    "status" public.user_status NOT NULL,
    "last_login" timestamp with time zone,
    "email_verified" boolean NOT NULL DEFAULT false,
    "verification_code" text,
    "verification_expires_at" timestamp with time zone
);

ALTER TABLE "public"."users" OWNER TO "postgres";
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");
ALTER TABLE "public"."users" ADD CONSTRAINT "users_business_id_fkey" FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "business_id" text NOT NULL,
    "rating" integer NOT NULL,
    "comment" text NOT NULL,
    "customer_name" text
);

ALTER TABLE "public"."reviews" OWNER TO "postgres";
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_business_id_fkey" FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."businesses" TO "anon";
GRANT ALL ON TABLE "public"."businesses" TO "authenticated";
GRANT ALL ON TABLE "public"."businesses" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";
