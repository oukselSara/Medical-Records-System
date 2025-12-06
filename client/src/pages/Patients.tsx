import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { patientsCollection, prescriptionsCollection, treatmentsCollection } from "@/lib/firestore";
import { GlassCard } from "@/components/GlassCard";
import { SkeletonList } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { jsPDF } from 'jspdf';
import type { Prescription, Treatment } from '@shared/schema';
import { generatePatientPDF } from "@/lib/pdfExport";

import { Download } from "lucide-react";
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
import {
  insertPatientSchema,
  type Patient,
  type InsertPatient,
} from "@shared/schema";
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplet,
  AlertTriangle,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { z } from "zod";

const formSchema = insertPatientSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function Patients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      email: "",
      phone: "",
      address: "",
      bloodType: undefined,
      allergies: [],
      medicalHistory: [],
      currentMedications: [],
      emergencyContactName: "",
      emergencyContactPhone: "",
      status: "active",
      createdBy: user?.id || "",
    },
  });

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    queryFn: () => patientsCollection.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPatient) => patientsCollection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({ title: "Patient created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (e) => {
      toast({
        title: "Failed to create patient  " + e,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      patientsCollection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({ title: "Patient updated successfully" });
      setIsDialogOpen(false);
      setEditingPatient(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update patient", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientsCollection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({ title: "Patient deleted successfully" });
      setSelectedPatient(null);
    },
    onError: () => {
      toast({ title: "Failed to delete patient", variant: "destructive" });
    },
  });

// Replace the entire handleExportPDF function in your Patients.tsx with this:

const handleExportPDF = async (patient: Patient) => {
  try {
    setIsExportingPDF(true);
    console.log('🚀 Starting PDF export for patient:', patient.firstName, patient.lastName);
    console.log('📋 Patient ID:', patient.id);
    
    toast({ title: "Fetching patient data..." });

    // Fetch patient's prescriptions and treatments with detailed logging
    console.log('📊 Fetching prescriptions for patient:', patient.id);
    const prescriptionsPromise = prescriptionsCollection.getByPatient(patient.id);
    
    console.log('🏥 Fetching treatments for patient:', patient.id);
    const treatmentsPromise = treatmentsCollection.getByPatient(patient.id);
    
    const [prescriptions, treatments] = await Promise.all([
      prescriptionsPromise.catch((err) => {
        console.error('❌ Error fetching prescriptions:', err);
        return [];
      }),
      treatmentsPromise.catch((err) => {
        console.error('❌ Error fetching treatments:', err);
        return [];
      })
    ]);

    console.log('✅ Prescriptions fetched:', prescriptions.length);
    console.log('📋 Prescription data:', prescriptions);
    console.log('✅ Treatments fetched:', treatments.length);
    console.log('🏥 Treatment data:', treatments);

    toast({ title: "Generating comprehensive PDF..." });

    // Generate the PDF with ALL data
    generatePatientPDF(patient, prescriptions, treatments);

    toast({ 
      title: "PDF exported successfully!",
      description: `Complete medical record with ${prescriptions.length} prescription(s) and ${treatments.length} treatment(s).`
    });
  } catch (error) {
    console.error('❌ Error exporting PDF:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast({
      title: "Failed to export PDF",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsExportingPDF(false);
  }
};

// ALSO - Make sure you have this import at the top of your Patients.tsx:
// import { generatePatientPDF } from "@/lib/pdfExport";

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = (values: FormValues) => {
    const data = {
      ...values,
      createdBy: user?.id || "",
      updatedBy: editingPatient ? user?.id : undefined,
    };

    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient.id, data });
    } else {
      createMutation.mutate(data as InsertPatient);
    }
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    form.reset({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      email: patient.email || "",
      phone: patient.phone || "",
      address: patient.address || "",
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
      currentMedications: patient.currentMedications,
      emergencyContactName: patient.emergencyContactName || "",
      emergencyContactPhone: patient.emergencyContactPhone || "",
      status: patient.status,
      createdBy: patient.createdBy,
    });
    setIsDialogOpen(true);
  };

  const canEdit = user?.role === "doctor" || user?.role === "nurse";
  const canCreate = user?.role === "doctor";
  const canDelete = user?.role === "doctor";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-pink-500" />
            Patients
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage patient records and medical information
          </p>
        </div>

        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                onClick={() => {
                  setEditingPatient(null);
                  form.reset();
                }}
                data-testid="button-add-patient"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-pink-100/50">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {editingPatient ? "Edit Patient" : "Add New Patient"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-dob"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-blood-type">
                                <SelectValue placeholder="Select blood type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="input-emergency-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Phone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="input-emergency-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                      className="bg-gradient-to-r from-pink-500 to-rose-500"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                      data-testid="button-submit-patient"
                    >
                      {editingPatient ? "Update" : "Create"} Patient
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
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 border-pink-100/50"
              data-testid="input-search-patients"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-40 bg-white/50 border-pink-100/50"
              data-testid="select-status-filter"
            >
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : filteredPatients.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-pink-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No patients found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by adding your first patient"}
          </p>
          {canCreate && !searchTerm && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-rose-500"
              data-testid="button-add-first-patient"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Patient
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className="p-5 cursor-pointer"
                  onClick={() => setSelectedPatient(patient)}
                  data-testid={`patient-card-${patient.id}`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14 border-2 border-pink-200/50">
                      <AvatarFallback className="bg-gradient-to-br from-pink-300 to-rose-400 text-white text-lg font-medium">
                        {patient.firstName[0]}
                        {patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <StatusBadge status={patient.status} />
                      </div>
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
                        {patient.bloodType && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Droplet className="w-3 h-3 text-red-400" />{" "}
                            {patient.bloodType}
                          </p>
                        )}
                      </div>
                      {patient.allergies && patient.allergies.length > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-600">
                            {patient.allergies.length} allergie(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-pink-100/30 dark:border-pink-900/20">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPDF(patient);
                        }}
                        disabled={isExportingPDF}
                        data-testid={`button-export-${patient.id}`}
                      >
                        <Download className="w-3 h-3 mr-1" /> PDF
                      </Button>
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-pink-200 text-pink-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(patient);
                          }}
                          data-testid={`button-edit-${patient.id}`}
                        >
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                "Are you sure you want to delete this patient?",
                              )
                            ) {
                              deleteMutation.mutate(patient.id);
                            }
                          }}
                          data-testid={`button-delete-${patient.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedPatient(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-pink-200/50">
                    <AvatarFallback className="bg-gradient-to-br from-pink-300 to-rose-400 text-white text-xl font-medium">
                      {selectedPatient.firstName[0]}
                      {selectedPatient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h2>
                    <StatusBadge status={selectedPatient.status} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-purple-200 text-purple-600"
                    onClick={() => handleExportPDF(selectedPatient)}
                    disabled={isExportingPDF}
                    data-testid="button-export-detail"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedPatient(null)}
                    data-testid="button-close-detail"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Personal Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-pink-500" />
                      <span className="text-muted-foreground">DOB:</span>
                      {selectedPatient.dateOfBirth}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 text-center text-pink-500">
                        {selectedPatient.gender === "male"
                          ? "M"
                          : selectedPatient.gender === "female"
                            ? "F"
                            : "O"}
                      </span>
                      <span className="text-muted-foreground">Gender:</span>
                      {selectedPatient.gender}
                    </p>
                    {selectedPatient.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-pink-500" />
                        {selectedPatient.email}
                      </p>
                    )}
                    {selectedPatient.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-pink-500" />
                        {selectedPatient.phone}
                      </p>
                    )}
                    {selectedPatient.address && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-pink-500" />
                        {selectedPatient.address}
                      </p>
                    )}
                    {selectedPatient.bloodType && (
                      <p className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-red-500" />
                        <span className="text-muted-foreground">
                          Blood Type:
                        </span>
                        {selectedPatient.bloodType}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Emergency Contact
                  </h3>
                  <div className="space-y-2 text-sm">
                    {selectedPatient.emergencyContactName && (
                      <p>{selectedPatient.emergencyContactName}</p>
                    )}
                    {selectedPatient.emergencyContactPhone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-pink-500" />
                        {selectedPatient.emergencyContactPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedPatient.allergies &&
                selectedPatient.allergies.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />{" "}
                      Allergies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.allergies.map((allergy, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-md bg-amber-100 text-amber-700 border border-amber-200"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {selectedPatient.currentMedications &&
                selectedPatient.currentMedications.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Current Medications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.currentMedications.map((med, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700 border border-blue-200"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}