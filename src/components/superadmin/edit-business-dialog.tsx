
'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Business } from '@/lib/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditBusinessDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  business: Business | null;
  onUpdateBusiness: (business: Business) => void;
}

const formSchema = z.object({
  subscriptionAmount: z.coerce.number().min(0, 'Subscription must be a positive number.'),
  status: z.enum(['active', 'inactive']),
});

type FormValues = z.infer<typeof formSchema>;

export function EditBusinessDialog({ isOpen, onOpenChange, business, onUpdateBusiness }: EditBusinessDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (business) {
      form.reset({
        subscriptionAmount: business.subscriptionAmount,
        status: business.status,
      });
    }
  }, [business, form]);

  if (!business) return null;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    onUpdateBusiness({ ...business, ...data });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit: {business.name}</DialogTitle>
          <DialogDescription>
            Update the subscription details and account status.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
