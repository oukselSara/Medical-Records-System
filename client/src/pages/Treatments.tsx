import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { treatmentsCollection, patientsCollection } from "@/lib/firestore";
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
import { insertTreatmentSchema, type Treatment, type InsertTreatment, type Patient } from "@shared/schema";
import {
  Plus,
  Search,
  Activity,
  User,
  Calendar,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Stethoscope,
  AlertTriangle,
  PlayCircle,
} from "lucide-react";
import { z } from "zod";

const formSchema = insertTreatmentSchema.extend({
  patientId: z.string().min(1, "Patient is required"),
  treatmentType: z.string().min(1, "Treatment type is required"),
  description: z.string().min(1, "Description is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Treatments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      patientName: "",
      treatmentType: "",
      description: "",
      diagnosis: "",
      notes: "",
      status: "scheduled",
      priority: "medium",
      scheduledDate: "",
      createdBy: user?.id || "",
      createdByName: user?.displayName || "",
    },
  });

  const { data: treatments = [], isLoading } = useQuery<Treatment[]>({
    queryKey: ["/api/treatments"],
    queryFn: () => treatmentsCollection.getAll(),
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    queryFn: () => patientsCollection.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertTreatment) => treatmentsCollection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({ title: "Treatment scheduled successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create treatment", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Treatment> }) =>
      treatmentsCollection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({ title: "Treatment updated successfully" });
      setIsDialogOpen(false);
      setEditingTreatment(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update treatment", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => treatmentsCollection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({ title: "Treatment deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete treatment", variant: "destructive" });
    },
  });

  const startTreatmentMutation = useMutation({
    mutationFn: (id: string) =>
      treatmentsCollection.update(id, { status: "in-progress" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({ title: "Treatment started" });
    },
  });

  const completeTreatmentMutation = useMutation({
    mutationFn: (id: string) =>
      treatmentsCollection.update(id, {
        status: "completed",
        completedDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({ title: "Treatment completed" });
    },
  });

  const filteredTreatments = treatments.filter((treatment) => {
    const matchesSearch =
      treatment.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || treatment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = (values: FormValues) => {
    const selectedPatient = patients.find((p) => p.id === values.patientId);
    const data = {
      ...values,
      patientName: selectedPatient
        ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
        : values.patientName,
      createdBy: user?.id || "",
      createdByName: user?.displayName || "",
    };

    if (editingTreatment) {
      updateMutation.mutate({ id: editingTreatment.id, data });
    } else {
      createMutation.mutate(data as InsertTreatment);
    }
  };

  const openEditDialog = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    form.reset({
      patientId: treatment.patientId,
      patientName: treatment.patientName,
      treatmentType: treatment.treatmentType,
      description: treatment.description,
      diagnosis: treatment.diagnosis || "",
      notes: treatment.notes || "",
      status: treatment.status,
      priority: treatment.priority,
      scheduledDate: treatment.scheduledDate || "",
      createdBy: treatment.createdBy,
      createdByName: treatment.createdByName,
    });
    setIsDialogOpen(true);
  };

  const canCreate = user?.role === "doctor" || user?.role === "nurse";
  const canUpdate = user?.role === "doctor" || user?.role === "nurse";
  const canDelete = user?.role === "doctor";

  const treatmentTypes = [
    "Physical Therapy",
    "Chemotherapy",
    "Surgery",
    "Wound Care",
    "IV Therapy",
    "Blood Transfusion",
    "Dialysis",
    "Radiation Therapy",
    "Rehabilitation",
    "Mental Health Counseling",
    "Diagnostic Imaging",
    "Laboratory Tests",
    "Vaccination",
    "Pain Management",
    "Other",
  ];

  const priorityIcons = {
    low: null,
    medium: null,
    high: <AlertTriangle className="w-4 h-4 text-orange-500" />,
    urgent: <AlertTriangle className="w-4 h-4 text-red-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            Treatments
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule and track patient treatments
          </p>
        </div>

        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                onClick={() => {
                  setEditingTreatment(null);
                  form.reset();
                }}
                data-testid="button-add-treatment"
              >
                <Plus className="w-4 h-4 mr-2" /> Schedule Treatment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-pink-100/50">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {editingTreatment ? "Edit Treatment" : "Schedule Treatment"}
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
                    name="treatmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-treatment-type">
                              <SelectValue placeholder="Select treatment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {treatmentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the treatment..."
                            className="resize-none"
                            {...field}
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnosis</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Related diagnosis..."
                            {...field}
                            data-testid="input-diagnosis"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
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
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Date</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            data-testid="input-scheduled-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes..."
                            className="resize-none"
                            {...field}
                            data-testid="input-notes"
                          />
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
                      className="bg-gradient-to-r from-blue-500 to-purple-500"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit-treatment"
                    >
                      {editingTreatment ? "Update" : "Schedule"} Treatment
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
              placeholder="Search treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 border-pink-100/50"
              data-testid="input-search-treatments"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white/50 border-pink-100/50" data-testid="select-filter-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : filteredTreatments.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Activity className="w-16 h-16 mx-auto text-blue-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No treatments found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Start by scheduling a treatment"}
          </p>
          {canCreate && !searchTerm && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
              data-testid="button-schedule-first-treatment"
            >
              <Plus className="w-4 h-4 mr-2" /> Schedule Treatment
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTreatments.map((treatment, index) => (
              <motion.div
                key={treatment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-5" data-testid={`treatment-card-${treatment.id}`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br from-blue-400 to-purple-400 shadow-lg">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {treatment.treatmentType}
                          </h3>
                          {priorityIcons[treatment.priority]}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <User className="w-3 h-3" /> {treatment.patientName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {treatment.description}
                        </p>
                        {treatment.diagnosis && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Diagnosis: {treatment.diagnosis}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                          {treatment.scheduledDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(treatment.scheduledDate).toLocaleString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            By: {treatment.createdByName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={treatment.priority} />
                        <StatusBadge status={treatment.status} />
                      </div>
                      <div className="flex gap-2 mt-2">
                        {canUpdate && treatment.status === "scheduled" && (
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={() => startTreatmentMutation.mutate(treatment.id)}
                            data-testid={`button-start-${treatment.id}`}
                          >
                            <PlayCircle className="w-3 h-3 mr-1" /> Start
                          </Button>
                        )}
                        {canUpdate && treatment.status === "in-progress" && (
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600"
                            onClick={() => completeTreatmentMutation.mutate(treatment.id)}
                            data-testid={`button-complete-${treatment.id}`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Complete
                          </Button>
                        )}
                        {canUpdate && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-pink-200 text-pink-600"
                            onClick={() => openEditDialog(treatment)}
                            data-testid={`button-edit-${treatment.id}`}
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
                              if (confirm("Are you sure you want to delete this treatment?")) {
                                deleteMutation.mutate(treatment.id);
                              }
                            }}
                            data-testid={`button-delete-${treatment.id}`}
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
