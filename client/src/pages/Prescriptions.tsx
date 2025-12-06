import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { prescriptionsCollection, patientsCollection } from "@/lib/firestore";
import { GlassCard } from "@/components/GlassCard";
import { SkeletonList } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { insertPrescriptionSchema, type Prescription, type InsertPrescription, type Patient } from "@shared/schema";
import {
  Plus,
  Search,
  Pill,
  User,
  Calendar,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import { z } from "zod";

const formSchema = insertPrescriptionSchema.extend({
  patientId: z.string().min(1, "Patient is required"),
  medication: z.string().min(1, "Medication is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Prescriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      patientName: "",
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      prescribedBy: user?.id || "",
      prescribedByName: user?.displayName || "",
      status: "pending",
      dispensed: false,
    },
  });

  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
    queryFn: () => prescriptionsCollection.getAll(),
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    queryFn: () => patientsCollection.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPrescription) => prescriptionsCollection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({ title: "Prescription created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create prescription", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Prescription> }) =>
      prescriptionsCollection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({ title: "Prescription updated successfully" });
      setIsDialogOpen(false);
      setEditingPrescription(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update prescription", variant: "destructive" });
    },
  });

  const dispenseMutation = useMutation({
    mutationFn: (id: string) => prescriptionsCollection.dispense(id, user?.id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({ title: "Prescription dispensed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to dispense prescription", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => prescriptionsCollection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({ title: "Prescription deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete prescription", variant: "destructive" });
    },
  });

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchesSearch =
      rx.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = (values: FormValues) => {
    const selectedPatient = patients.find((p) => p.id === values.patientId);
    const data = {
      ...values,
      patientName: selectedPatient
        ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
        : values.patientName,
      prescribedBy: user?.id || "",
      prescribedByName: user?.displayName || "",
    };

    if (editingPrescription) {
      updateMutation.mutate({ id: editingPrescription.id, data });
    } else {
      createMutation.mutate(data as InsertPrescription);
    }
  };

  const openEditDialog = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    form.reset({
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions || "",
      prescribedBy: prescription.prescribedBy,
      prescribedByName: prescription.prescribedByName,
      status: prescription.status,
      dispensed: prescription.dispensed,
    });
    setIsDialogOpen(true);
  };

  const canCreate = user?.role === "doctor";
  const canDispense = user?.role === "pharmacist";
  const canDelete = user?.role === "doctor";

  const frequencyOptions = [
    "Once daily",
    "Twice daily",
    "Three times daily",
    "Four times daily",
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed",
    "Before meals",
    "After meals",
    "At bedtime",
  ];

  const durationOptions = [
    "3 days",
    "5 days",
    "7 days",
    "10 days",
    "14 days",
    "21 days",
    "30 days",
    "60 days",
    "90 days",
    "Ongoing",
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
            <Pill className="w-8 h-8 text-purple-500" />
            Prescriptions
          </h1>
          <p className="text-muted-foreground mt-1">
            {canDispense
              ? "Review and dispense patient prescriptions"
              : "Create and manage patient prescriptions"}
          </p>
        </div>

        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => {
                  setEditingPrescription(null);
                  form.reset();
                }}
                data-testid="button-add-prescription"
              >
                <Plus className="w-4 h-4 mr-2" /> New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-pink-100/50">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {editingPrescription ? "Edit Prescription" : "New Prescription"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-patient">
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.firstName} {patient.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medication"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Amoxicillin 500mg"
                            {...field}
                            data-testid="input-medication"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 1 tablet"
                            {...field}
                            data-testid="input-dosage"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-frequency">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {frequencyOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-duration">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {durationOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special instructions for the patient..."
                            className="resize-none"
                            {...field}
                            data-testid="input-instructions"
                          />
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
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
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
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit-prescription"
                    >
                      {editingPrescription ? "Update" : "Create"} Prescription
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 border-pink-100/50"
              data-testid="input-search-prescriptions"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white/50 border-pink-100/50" data-testid="select-filter-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : filteredPrescriptions.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Pill className="w-16 h-16 mx-auto text-purple-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No prescriptions found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Start by creating a new prescription"}
          </p>
          {canCreate && !searchTerm && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
              data-testid="button-create-first-prescription"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Prescription
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPrescriptions.map((rx, index) => (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-5" data-testid={`prescription-card-${rx.id}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg">
                        <Pill className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {rx.medication}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <User className="w-3 h-3" /> {rx.patientName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" /> {rx.dosage}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {rx.frequency}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {rx.duration}
                          </span>
                        </div>
                        {rx.instructions && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            "{rx.instructions}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={rx.status} />
                        {rx.dispensed && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <CheckCircle className="w-3 h-3" /> Dispensed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        By: {rx.prescribedByName}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {canDispense && !rx.dispensed && rx.status !== "cancelled" && (
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600"
                            onClick={() => dispenseMutation.mutate(rx.id)}
                            disabled={dispenseMutation.isPending}
                            data-testid={`button-dispense-${rx.id}`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Dispense
                          </Button>
                        )}
                        {canCreate && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-pink-200 text-pink-600"
                            onClick={() => openEditDialog(rx)}
                            data-testid={`button-edit-${rx.id}`}
                          >
                            <Edit className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this prescription?")) {
                                deleteMutation.mutate(rx.id);
                              }
                            }}
                            data-testid={`button-delete-${rx.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
