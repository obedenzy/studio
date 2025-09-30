
'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown, Loader2 } from 'lucide-react';
import { BusinessTable } from '@/components/superadmin/business-table';
import type { Business } from '@/lib/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createBusiness, getBusinesses } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(1, 'Business name is required.'),
  ownerName: z.string().min(1, 'Owner name is required.'),
  ownerEmail: z.string().email('Invalid email address.'),
  subscriptionAmount: z.coerce.number().min(0, 'Subscription must be a positive number.'),
  status: z.enum(['active', 'inactive']),
});

type FormValues = z.infer<typeof formSchema>;

export default function SuperAdminBusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchBusinesses = async () => {
        const biz = await getBusinesses();
        setBusinesses(biz);
    }
    
    useState(() => {
        fetchBusinesses();
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            ownerName: '',
            ownerEmail: '',
            subscriptionAmount: 99.99,
            status: 'active',
        },
    });

    const handleAddBusinessSubmit: SubmitHandler<FormValues> = async (data) => {
        setIsSubmitting(true);
        const result = await createBusiness(data);

        if (result.success) {
            fetchBusinesses();
            toast({
                title: 'Success!',
                description: result.message,
            });
            form.reset();
            setIsAddBusinessOpen(false);
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
        }
        setIsSubmitting(false);
    };

    const handleUpdateBusiness = (updatedBusiness: Business) => {
        setBusinesses(prev => prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b));
    };

  return (
    <div className="space-y-6">
      <Collapsible open={isAddBusinessOpen} onOpenChange={setIsAddBusinessOpen}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-2xl">Manage Businesses</CardTitle>
              <CardDescription>
                View, add, and manage all business accounts on the platform.
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
               <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Business
                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isAddBusinessOpen ? 'rotate-180' : ''}`} />
                </Button>
            </CollapsibleTrigger>
          </CardHeader>
           <CollapsibleContent>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddBusinessSubmit)} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Business Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Corporation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="ownerName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Owner's Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="ownerEmail"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Owner's Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="owner@acme.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="subscriptionAmount"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Subscription ($/mo)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Account Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAddBusinessOpen(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : 'Add Business'}
                            </Button>
                        </div>
                    </form>
                    </Form>
                </CardContent>
           </CollapsibleContent>
        </Card>
      </Collapsible>
      
      <Card>
        <CardHeader>
            <CardTitle>All Businesses</CardTitle>
        </CardHeader>
        <CardContent>
            <BusinessTable businesses={businesses} onUpdateBusiness={handleUpdateBusiness} />
        </CardContent>
      </Card>
    </div>
  );
}
