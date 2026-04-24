// client/src/pages/Admin.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  usersCollection,
  patientsCollection,
  prescriptionsCollection,
  treatmentsCollection,
  appointmentsCollection
} from "@/lib/firestore";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User, UserRole, Patient } from "@shared/schema";
import {
  Shield,
  Search,
  Edit,
  Trash2,
  Mail,
  CheckCircle,
  XCircle,
  Users,
  Activity,
  Link as LinkIcon,
  UserPlus,
  Calendar,
  Phone,
  MapPin,
  Pill,
  Stethoscope,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
} from "lucide-react";
import { z } from "zod";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const formSchema = z.object({
  email: z.string().email("Valid email required"),
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "doctor", "nurse", "pharmacist", "patient"]),
  department: z.string().optional(),
  licenseNumber: z.string().optional(),
  patientId: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState("users");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      displayName: "",
      role: "patient",
      department: "",
      licenseNumber: "",
      patientId: "",
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const allUsers = await usersCollection.getAll();
      return allUsers;
    },
    enabled: user?.role === "admin",
  });

  const { data: patients = [], isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/admin/patients"],
    queryFn: async () => {
      const allPatients = await patientsCollection.getAll();
      return allPatients;
    },
    enabled: user?.role === "admin",
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["/api/admin/prescriptions"],
    queryFn: () => prescriptionsCollection.getAll(),
    enabled: user?.role === "admin",
  });

  const { data: treatments = [] } = useQuery({
    queryKey: ["/api/admin/treatments"],
    queryFn: () => treatmentsCollection.getAll(),
    enabled: user?.role === "admin",
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/admin/appointments"],
    queryFn: () => appointmentsCollection.getAll(),
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

  const linkPatientMutation = useMutation({
    mutationFn: async ({ userId, patientId }: { userId: string; patientId: string }) => {
      // Update user with patient link
      await usersCollection.update(userId, { patientId });
      // Update patient with user link
      await patientsCollection.update(patientId, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/patients"] });
      toast({ title: "Patient linked successfully" });
    },
    onError: () => {
      toast({ title: "Failed to link patient", variant: "destructive" });
    },
  });

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

  const unlinkedPatients = patients.filter(p => !p.userId);
  const linkedPatients = patients.filter(p => p.userId);

  // Calculate comprehensive statistics
  const activeUsers = users.filter((u) => u.isActive);
  const inactiveUsers = users.filter((u) => !u.isActive);

  // User statistics by role
  const doctorsCount = users.filter((u) => u.role === "doctor").length;
  const nursesCount = users.filter((u) => u.role === "nurse").length;
  const pharmacistsCount = users.filter((u) => u.role === "pharmacist").length;
  const patientUsersCount = users.filter((u) => u.role === "patient").length;

  // Patient statistics
  const activePatients = patients.filter((p) => p.status === "active").length;
  const criticalPatients = patients.filter((p) => p.status === "critical").length;
  const inactivePatients = patients.filter((p) => p.status === "inactive").length;

  // Prescription statistics
  const activePrescriptions = prescriptions.filter((p) => p.status === "active").length;
  const completedPrescriptions = prescriptions.filter((p) => p.status === "completed").length;
  const pendingPrescriptions = prescriptions.filter((p) => p.status === "pending").length;
  const dispensedPrescriptions = prescriptions.filter((p) => p.dispensed).length;

  // Treatment statistics
  const activeTreatments = treatments.filter((t) => t.status === "active").length;
  const completedTreatments = treatments.filter((t) => t.status === "completed").length;

  // Appointment statistics
  const scheduledAppointments = appointments.filter((a) => a.status === "scheduled").length;
  const completedAppointments = appointments.filter((a) => a.status === "completed").length;
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled").length;

  // Calculate trends (comparing last 7 days vs previous 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentPatients = patients.filter((p) => {
    const createdDate = new Date(p.createdAt);
    return createdDate >= sevenDaysAgo;
  }).length;

  const previousWeekPatients = patients.filter((p) => {
    const createdDate = new Date(p.createdAt);
    return createdDate >= fourteenDaysAgo && createdDate < sevenDaysAgo;
  }).length;

  const patientTrend = previousWeekPatients === 0
    ? (recentPatients > 0 ? 100 : 0)
    : ((recentPatients - previousWeekPatients) / previousWeekPatients) * 100;

  const recentPrescriptions = prescriptions.filter((p) => {
    const createdDate = new Date(p.createdAt);
    return createdDate >= sevenDaysAgo;
  }).length;

  const previousWeekPrescriptions = prescriptions.filter((p) => {
    const createdDate = new Date(p.createdAt);
    return createdDate >= fourteenDaysAgo && createdDate < sevenDaysAgo;
  }).length;

  const prescriptionTrend = previousWeekPrescriptions === 0
    ? (recentPrescriptions > 0 ? 100 : 0)
    : ((recentPrescriptions - previousWeekPrescriptions) / previousWeekPrescriptions) * 100;

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
      patientId: userToEdit.patientId || "",
    });
    setIsDialogOpen(true);
  };

  const primaryStats = [
    {
      label: "Total Users",
      value: users.length,
      subValue: `${activeUsers.length} active`,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Total Patients",
      value: patients.length,
      subValue: `${criticalPatients} critical`,
      icon: UserCheck,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
      trend: patientTrend,
    },
    {
      label: "Prescriptions",
      value: prescriptions.length,
      subValue: `${activePrescriptions} active`,
      icon: Pill,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      trend: prescriptionTrend,
    },
    {
      label: "Treatments",
      value: treatments.length,
      subValue: `${activeTreatments} active`,
      icon: Stethoscope,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  const detailedStats = [
    {
      category: "Staff Distribution",
      items: [
        { label: "Doctors", value: doctorsCount, icon: Stethoscope, color: "text-purple-600" },
        { label: "Nurses", value: nursesCount, icon: Activity, color: "text-blue-600" },
        { label: "Pharmacists", value: pharmacistsCount, icon: Pill, color: "text-teal-600" },
      ],
    },
    {
      category: "Patient Status",
      items: [
        { label: "Active", value: activePatients, icon: CheckCircle, color: "text-emerald-600" },
        { label: "Critical", value: criticalPatients, icon: AlertCircle, color: "text-red-600" },
        { label: "Inactive", value: inactivePatients, icon: XCircle, color: "text-gray-600" },
      ],
    },
    {
      category: "Prescriptions",
      items: [
        { label: "Active", value: activePrescriptions, icon: Activity, color: "text-emerald-600" },
        { label: "Pending", value: pendingPrescriptions, icon: Clock, color: "text-orange-600" },
        { label: "Completed", value: completedPrescriptions, icon: CheckCircle, color: "text-blue-600" },
      ],
    },
    {
      category: "Appointments",
      items: [
        { label: "Scheduled", value: scheduledAppointments, icon: Calendar, color: "text-blue-600" },
        { label: "Completed", value: completedAppointments, icon: CheckCircle, color: "text-emerald-600" },
        { label: "Cancelled", value: cancelledAppointments, icon: XCircle, color: "text-red-600" },
      ],
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
            Manage users, patients, and system settings
          </p>
        </div>
      </div>

      {/* Primary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                      {stat.value}
                    </p>
                    {stat.trend !== undefined && (
                      <span className={`flex items-center text-xs font-medium ${
                        stat.trend >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {stat.trend >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-0.5" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                        )}
                        {Math.abs(stat.trend).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
                </div>
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} shadow-md`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {detailedStats.map((section) => (
          <GlassCard key={section.category} className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              {section.category}
            </h3>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Quick Insights Section */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          System Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">User Activity Rate</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {users.length > 0 ? ((activeUsers.length / users.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                style={{ width: `${users.length > 0 ? (activeUsers.length / users.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Patient Link Rate</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {patients.length > 0 ? ((linkedPatients.length / patients.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all"
                style={{ width: `${patients.length > 0 ? (linkedPatients.length / patients.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Prescription Completion</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {prescriptions.length > 0 ? ((completedPrescriptions / prescriptions.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${prescriptions.length > 0 ? (completedPrescriptions / prescriptions.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Patients (7 days)</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{recentPatients}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Prescriptions (7 days)</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{recentPrescriptions}</p>
            </div>
          </div>

          {unlinkedPatients.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unlinked Patients</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{unlinkedPatients.length}</p>
              </div>
            </div>
          )}

          {criticalPatients > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-500">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Patients</p>
                <p className="text-xl font-bold text-red-600">{criticalPatients}</p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Tabs for Users and Patients */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <GlassCard className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-pink-100/50"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40 bg-white/50 border-pink-100/50">
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

          {usersLoading ? (
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
                {filteredUsers.map((u, index) => {
                  const linkedPatient = patients.find(p => p.id === u.patientId);
                  return (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassCard className="p-5">
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
                                {linkedPatient && (
                                  <span className="text-xs px-2 py-1 rounded-md bg-pink-100 text-pink-700 border border-pink-200 flex items-center gap-1">
                                    <LinkIcon className="w-3 h-3" />
                                    {linkedPatient.firstName} {linkedPatient.lastName}
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
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-4">
          {patientsLoading ? (
            <SkeletonList count={4} />
          ) : patients.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-pink-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No patients found
              </h3>
              <p className="text-muted-foreground">
                No patient records in the system yet
              </p>
            </GlassCard>
          ) : (
            <>
              {unlinkedPatients.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-orange-500" />
                    Unlinked Patients ({unlinkedPatients.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {unlinkedPatients.map((patient) => (
                      <GlassCard key={patient.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-pink-200/50">
                              <AvatarFallback className="bg-gradient-to-br from-pink-300 to-rose-400 text-white">
                                {patient.firstName[0]}{patient.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                                {patient.firstName} {patient.lastName}
                              </h4>
                              {patient.email && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {patient.email}
                                </p>
                              )}
                              {patient.phone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {patient.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          <Select
                            onValueChange={(userId) => {
                              linkPatientMutation.mutate({
                                userId,
                                patientId: patient.id,
                              });
                            }}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue placeholder="Link User" />
                            </SelectTrigger>
                            <SelectContent>
                              {users
                                .filter((u) => u.role === "patient" && !u.patientId)
                                .map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.displayName}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-500" />
                All Patients ({patients.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {patients.map((patient) => {
                  const linkedUser = users.find(u => u.id === patient.userId);
                  return (
                    <GlassCard key={patient.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 border-2 border-pink-200/50">
                          <AvatarFallback className="bg-gradient-to-br from-pink-300 to-rose-400 text-white">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 dark:text-white">
                            {patient.firstName} {patient.lastName}
                          </h4>
                          {linkedUser && (
                            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                              <CheckCircle className="w-3 h-3" />
                              Linked to {linkedUser.displayName}
                            </p>
                          )}
                          <div className="mt-2 space-y-1">
                            {patient.email && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {patient.email}
                              </p>
                            )}
                            {patient.phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {patient.phone}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {patient.dateOfBirth}
                            </p>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

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
                      <Input {...field} />
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
                      <Input {...field} type="email" disabled />
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
                        <SelectTrigger>
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

              {form.watch("role") === "patient" && (
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Patient Record</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unlinkedPatients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.firstName} {p.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500"
                  disabled={updateUserMutation.isPending}
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