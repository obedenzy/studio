
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import type { Payment, Business } from '@/lib/types';
import { getPayments, getBusinesses } from '@/lib/actions';


export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const [businessFilter, setBusinessFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [date, setDate] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 15;

  useEffect(() => {
    async function loadData() {
        setLoading(true);
        const [paymentData, businessData] = await Promise.all([
            getPayments(),
            getBusinesses()
        ]);
        setPayments(paymentData);
        setBusinesses(businessData);
        setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
      return <div>Loading payment data...</div>;
  }

  const filteredPayments = payments
    .filter(payment => {
      const businessMatch = businessFilter === 'all' || payment.businessId === businessFilter;
      const statusMatch = statusFilter === 'all' || payment.status === statusFilter;
      
      let dateMatch = true;
      if (date?.from && date?.to) {
        const paymentDate = new Date(payment.date);
        dateMatch = paymentDate >= date.from && paymentDate <= date.to;
      } else if (date?.from) {
        const paymentDate = new Date(payment.date);
        dateMatch = paymentDate >= date.from;
      }

      return businessMatch && statusMatch && dateMatch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * paymentsPerPage,
    currentPage * paymentsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setBusinessFilter('all');
    setStatusFilter('all');
    setDate(undefined);
    setCurrentPage(1);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Payment History</CardTitle>
        <CardDescription>
          Browse and manage all subscription payments across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={businessFilter} onValueChange={setBusinessFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by Business" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Businesses</SelectItem>
              {businesses.map(business => (
                <SelectItem key={business.id} value={business.id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

           <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full md:w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>

        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedPayments.map(payment => (
                <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                    <TableCell className="font-medium">{payment.businessName}</TableCell>
                    <TableCell>{format(new Date(payment.date), 'PPP')}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                    <Badge 
                        variant={
                            payment.status === 'succeeded' ? 'secondary' : 
                            payment.status === 'failed' ? 'destructive' : 'outline'
                        }
                    >
                        {payment.status}
                    </Badge>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(Math.max(1, currentPage - 1)); }} aria-disabled={currentPage === 1} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                 <PaginationItem key={page}>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page); }} isActive={page === currentPage}>
                        {page}
                    </PaginationLink>
                </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(Math.min(totalPages, currentPage + 1)); }} aria-disabled={currentPage === totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

      </CardContent>
    </Card>
  );
}
