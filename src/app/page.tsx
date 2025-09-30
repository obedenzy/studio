import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/shared/header';
import Link from 'next/link';
import { ArrowRight, Check, Share2, Star, Target } from 'lucide-react';
import { Logo } from '@/components/icons/logo';

const features = [
    {
      icon: <Target className="size-8 mb-4 text-primary" />,
      title: 'Intelligent Review Routing',
      description: 'Automatically guide happy customers to Google, while capturing negative feedback privately for internal improvement.',
    },
    {
      icon: <Share2 className="size-8 mb-4 text-primary" />,
      title: 'Simple, Sharable Link',
      description: 'Use a single, easy-to-share link on receipts, email signatures, or social media to gather feedback from all your customers.',
    },
    {
      icon: <Star className="size-8 mb-4 text-primary" />,
      title: 'Boost Your Online Reputation',
      description: 'Increase the volume of 4 and 5-star reviews on Google to build trust and attract new customers.',
    },
  ];

  const steps = [
      {
        name: 'Share Your Link',
        description: 'Provide customers with your unique, simple link to your branded review page.',
        icon: <Share2 className="size-10 text-primary" />,
      },
      {
        name: 'Customers Rate Experience',
        description: 'A quick star rating on a clean interface determines the next step in their journey.',
        icon: <Star className="size-10 text-primary" />,
      },
      {
        name: 'Intelligent Routing',
        description: 'Positive reviews are directed to Google, while constructive feedback is kept internal.',
        icon: <Target className="size-10 text-primary" />,
      },
  ]

export default function Home() {

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-24 md:py-32 lg:py-40">
          <div className="absolute top-0 left-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
                Smart Feedback Management
              </div>
              <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Control Your Online Reputation
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Our tool intelligently guides happy customers to your Google review page to boost your rating, while capturing constructive feedback privately so you can improve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                 <Button size="lg" asChild>
                  <Link href="/signup">Get Started Free <ArrowRight /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                   <Link href="/login">Business Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 md:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">The Smart Way to Build Your Brand</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                        Turn every customer interaction into a growth opportunity.
                    </p>
                </div>
                <div className="mx-auto grid items-start gap-8 sm:max-w-4xl md:grid-cols-3 md:gap-12 lg:max-w-5xl">
                    {features.map((feature, index) => (
                        <div key={index} className="grid gap-1 rounded-lg border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-lg">
                            {feature.icon}
                            <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 md:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                     <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
                        How It Works
                    </div>
                    <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">A Simple 3-Step Process</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                        Streamline your feedback loop and amplify positive reviews effortlessly.
                    </p>
                </div>
                 <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
                     <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-4 hidden md:block" aria-hidden="true" />
                     {steps.map((step, index) => (
                        <div key={index} className="relative flex flex-col items-center text-center gap-4 p-4">
                           <div className="absolute -top-8 md:top-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 h-8 w-px md:h-px md:w-8 bg-border" aria-hidden="true" />
                           <div className="flex size-16 items-center justify-center rounded-full bg-background border shadow-md">
                                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                                    {index + 1}
                                </div>
                           </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold font-headline">{step.name}</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 bg-muted/40">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    Ready to grow your business?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Start turning your customer feedback into a powerful growth engine today.
                </p>
                </div>
                <div className="mx-auto w-full max-w-sm space-y-2">
                    <Button size="lg" asChild className="w-full">
                        <Link href="/signup">
                            Sign Up - It's Free
                        </Link>
                     </Button>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container px-4 md:px-6 py-12 grid gap-10 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-4">
                <Logo />
                <p className="text-muted-foreground max-w-xs">The easiest way to manage your online reputation and gather valuable customer feedback.</p>
                 <p className="text-sm text-muted-foreground">© 2024 Review Router. All rights reserved.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:col-span-8">
                <div className="grid gap-2">
                    <h3 className="font-semibold font-headline">Product</h3>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">Features</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">Pricing</Link>
                    <Link href="/login" className="text-muted-foreground hover:text-foreground">Login</Link>
                    <Link href="/signup" className="text-muted-foreground hover:text-foreground">Sign Up</Link>
                </div>
                 <div className="grid gap-2">
                    <h3 className="font-semibold font-headline">Company</h3>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">About Us</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">Contact</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">Careers</Link>
                </div>
                 <div className="grid gap-2">
                    <h3 className="font-semibold font-headline">Legal</h3>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
