
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
import { PlusCircle, MoreHorizontal, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TeamUser } from '@/lib/types';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { inviteUser, deleteUser, getTeamUsers, getCurrentUser } from '@/lib/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

const formSchema = z.object({
  name: z.string().min(1, 'Full name is required.'),
  email: z.string().email('Invalid email address.'),
  role: z.enum(['Admin', 'Standard']),
});

type FormValues = z.infer<typeof formSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<TeamUser | null>(null);
  const { toast } = useToast();
  
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [businessId, setBusinessId] = useState('');

  const refreshUsers = async (bId: string) => {
    const fetchedUsers = await getTeamUsers(bId);
    setUsers(fetchedUsers);
  }

  useEffect(() => {
    async function fetchData() {
        const cUser = await getCurrentUser();
        if (cUser && cUser.businessId) {
            setCurrentUser(cUser);
            setBusinessId(cUser.businessId);
            await refreshUsers(cUser.businessId);
        }
        setLoading(false);
    }
    fetchData();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Standard',
    },
  });

  const handleAddUser: SubmitHandler<FormValues> = async (data) => {
    if (!businessId) return;
    setIsSubmitting(true);
    const result = await inviteUser(businessId, data);

    if (result.success) {
      refreshUsers(businessId); // Refresh users from DB
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.reset();
      setIsAddUserOpen(false);
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !businessId) return;

    const result = await deleteUser(businessId, userToDelete.id);

    if (result.success) {
        refreshUsers(businessId); // Refresh users from DB
        toast({
            title: 'User Deleted',
            description: `Successfully deleted ${userToDelete.name}.`,
        });
    } else {
        toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
        });
    }
    setUserToDelete(null);
  };

  const filteredUsers = users
    .filter(user => {
        const roleMatch = roleFilter === 'all' || user.role === roleFilter;
        const statusMatch = statusFilter === 'all' || user.status === statusFilter;
        
        const now = new Date();
        const userDate = new Date(user.createdAt);
        if (isNaN(userDate.getTime())) return false;

        const dateMatch =
            dateFilter === 'all' ||
            (dateFilter === 'last_30_days' && userDate >= subDays(now, 30));

        return roleMatch && statusMatch && dateMatch;
    })
    .sort((a, b) => {
        if (dateFilter === 'newest') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (dateFilter === 'oldest') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading) {
      return <div>Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <Collapsible open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-2xl">
                User Management
              </CardTitle>
              <CardDescription>
                Invite, manage, and remove team members for business ID: {businessId}
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create User
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isAddUserOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
             <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddUser)} className="grid md:grid-cols-3 gap-4 items-end">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>User Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Standard">Standard</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting} className="self-end">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Invite'}
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
             <CardTitle>Team Members</CardTitle>
             <CardDescription>A list of all users in this business account.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center gap-4 mb-4">
                <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="invited">Invited</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={(value) => { setDateFilter(value); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="last_30_days">Last 30 days</SelectItem>
                        <SelectItem value="newest">Sort by Newest</SelectItem>
                        <SelectItem value="oldest">Sort by Oldest</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://picsum.photos/seed/${user.id}/40/40`}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'secondary' : 'outline'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                        {user.status === 'active' && user.lastLogin ? `${formatDistanceToNow(new Date(user.lastLogin))} ago` : 'Pending invite'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                        {format(new Date(user.createdAt), 'PPP')}
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setUserToDelete(user)}
                                disabled={user.email === currentUser?.email} // Disable deleting self
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           <Pagination className="mt-4">
              <PaginationContent>
                  <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePreviousPage(); }} aria-disabled={currentPage === 1} />
                  </PaginationItem>
                  <PaginationItem>
                      <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                      </span>
                  </PaginationItem>
                  <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handleNextPage(); }} aria-disabled={currentPage === totalPages} />
                  </PaginationItem>
              </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
      
       <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for{' '}
              <span className="font-semibold">{userToDelete?.name}</span> and remove their access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
              Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
