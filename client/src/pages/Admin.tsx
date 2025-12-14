// client/src/pages/Admin.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usersCollection } from "@/lib/firestore";
import { GlassCard } from "@/components/GlassCard";
import { SkeletonList } from "@/components/LoadingSpinner";
import { RoleBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User, UserRole } from "@shared/schema";
import {
  Shield,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Activity,
} from "lucide-react";
import { z } from "zod";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const formSchema = z.object({
  email: z.string().email("Valid email required"),
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "doctor", "nurse", "pharmacist", "patient"]),
  department: z.string().optional(),
  licenseNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      displayName: "",
      role: "patient",
      department: "",
      licenseNumber: "",
    },
  });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      // This should fetch all users from Firestore
      const allUsers = await usersCollection.getAll();
      return allUsers;
    },
    enabled: user?.role === "admin",
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      usersCollection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setIsDialogOpen(false);
      setEditingUser(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersCollection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersCollection.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User status updated" });
    },
  });

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <GlassCard className="p-12 text-center">
          <Shield className="w-16 h-16 mx-auto text-red-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </GlassCard>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const onSubmit = (values: FormValues) => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        data: {
          ...values,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  };

  const openEditDialog = (userToEdit: User) => {
    setEditingUser(userToEdit);
    form.reset({
      email: userToEdit.email,
      displayName: userToEdit.displayName,
      role: userToEdit.role,
      department: userToEdit.department || "",
      licenseNumber: userToEdit.licenseNumber || "",
    });
    setIsDialogOpen(true);
  };

  // Statistics
  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Active Users",
      value: users.filter((u) => u.isActive).length,
      icon: Activity,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Doctors",
      value: users.filter((u) => u.role === "doctor").length,
      icon: Shield,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Patients",
      value: users.filter((u) => u.role === "patient").length,
      icon: Users,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-500" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users and system settings
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br ${stat.color} shadow-lg`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 border-pink-100/50"
              data-testid="input-search-users"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger
              className="w-40 bg-white/50 border-pink-100/50"
              data-testid="select-role-filter"
            >
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="nurse">Nurse</SelectItem>
              <SelectItem value="pharmacist">Pharmacist</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Users List */}
      {isLoading ? (
        <SkeletonList count={4} />
      ) : filteredUsers.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-indigo-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No users found
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "No users in the system yet"}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredUsers.map((u, index) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className="p-5"
                  data-testid={`user-card-${u.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-indigo-200/50">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                          {u.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {u.displayName}
                          </h3>
                          {u.isActive ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="w-3 h-3" /> {u.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <RoleBadge role={u.role} />
                          {u.department && (
                            <span className="text-xs text-muted-foreground">
                              {u.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className={
                          u.isActive
                            ? "border-red-200 text-red-600"
                            : "border-emerald-200 text-emerald-600"
                        }
                        onClick={() =>
                          toggleUserStatusMutation.mutate({
                            id: u.id,
                            isActive: !u.isActive,
                          })
                        }
                        data-testid={`button-toggle-status-${u.id}`}
                      >
                        {u.isActive ? (
                          <>
                            <XCircle className="w-3 h-3 mr-1" /> Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" /> Activate
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-indigo-200 text-indigo-600"
                        onClick={() => openEditDialog(u)}
                        data-testid={`button-edit-${u.id}`}
                      >
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      {u.id !== user.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this user?"
                              )
                            ) {
                              deleteUserMutation.mutate(u.id);
                            }
                          }}
                          data-testid={`button-delete-${u.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-display-name" />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        disabled
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                        <SelectItem value="patient">Patient</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-department" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-license" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500"
                  disabled={updateUserMutation.isPending}
                  data-testid="button-submit-user"
                >
                  Update User
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}