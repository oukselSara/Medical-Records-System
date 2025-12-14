// client/src/pages/PatientPortal.tsx
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  patientsCollection,
  prescriptionsCollection,
  treatmentsCollection,
  appointmentsCollection,
} from "@/lib/firestore";
import { GlassCard } from "@/components/GlassCard";
import { SkeletonList } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  User,
  Calendar,
  Pill,
  Activity,
  FileText,
  Clock,
  Phone,
  Mail,
  MapPin,
  Droplet,
  AlertTriangle,
  Download,
  Heart,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import type { Patient, Prescription, Treatment, Appointment } from "@shared/schema";
import { generatePatientPDF } from "@/lib/pdfExport";
import { useToast } from "@/hooks/use-toast";

export default function PatientPortal() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: patient, isLoading: patientLoading } = useQuery<Patient | null>({
    queryKey: ["/api/patient/profile", user?.patientId],
    queryFn: async () => {
      if (!user?.patientId) return null;
      return await patientsCollection.get(user.patientId);
    },
    enabled: user?.role === "patient" && !!user?.patientId,
  });

  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/patient/prescriptions", user?.patientId],
    queryFn: async () => {
      if (!user?.patientId) return [];
      return await prescriptionsCollection.getByPatient(user.patientId);
    },
    enabled: user?.role === "patient" && !!user?.patientId,
  });

  const { data: treatments = [], isLoading: treatmentsLoading } = useQuery<Treatment[]>({
    queryKey: ["/api/patient/treatments", user?.patientId],
    queryFn: async () => {
      if (!user?.patientId) return [];
      return await treatmentsCollection.getByPatient(user.patientId);
    },
    enabled: user?.role === "patient" && !!user?.patientId,
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/patient/appointments", user?.patientId],
    queryFn: async () => {
      if (!user?.patientId) return [];
      return await appointmentsCollection.getByPatient(user.patientId);
    },
    enabled: user?.role === "patient" && !!user?.patientId,
  });

  const isLoading = patientLoading || prescriptionsLoading || treatmentsLoading || appointmentsLoading;

  if (user?.role !== "patient") {
    return (
      <div className="p-6">
        <GlassCard className="p-12 text-center">
          <User className="w-16 h-16 mx-auto text-red-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            This portal is only accessible to patients.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!user?.patientId) {
    return (
      <div className="p-6">
        <GlassCard className="p-12 text-center">
          <User className="w-16 h-16 mx-auto text-amber-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            No Patient Record Linked
          </h2>
          <p className="text-muted-foreground mb-4">
            Your account is not linked to a patient record yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact an administrator to link your account to your medical records.
          </p>
        </GlassCard>
      </div>
    );
  }

  const handleExportPDF = async () => {
    if (!patient) return;
    try {
      toast({ title: "Generating PDF..." });
      generatePatientPDF(patient, prescriptions, treatments);
      toast({ title: "PDF exported successfully!" });
    } catch (error) {
      toast({
        title: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "scheduled" || apt.status === "confirmed"
  );

  const activePrescriptions = prescriptions.filter(
    (rx) => rx.status === "active" || rx.status === "pending"
  );

  const upcomingTreatments = treatments.filter(
    (t) => t.status === "scheduled" || t.status === "in-progress"
  );

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" fill="currentColor" />
            My Health Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {patient?.firstName}! View your medical records and appointments
          </p>
        </div>
        {patient && (
          <Button
            className="bg-gradient-to-r from-pink-500 to-rose-500"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Records
          </Button>
        )}
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : (
        <>
          {/* Patient Profile Card */}
          {patient && (
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-24 h-24 border-4 border-pink-200/50">
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-3xl font-bold">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {patient.firstName} {patient.lastName}
                    </h2>
                    <StatusBadge status={patient.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Personal Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-pink-500" />
                          <span className="text-muted-foreground">Age:</span>
                          {calculateAge(patient.dateOfBirth)} years
                        </p>
                        <p className="flex items-center gap-2">
                          <User className="w-4 h-4 text-pink-500" />
                          <span className="text-muted-foreground">Gender:</span>
                          {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                        </p>
                        {patient.bloodType && (
                          <p className="flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-red-500" />
                            <span className="text-muted-foreground">Blood Type:</span>
                            <span className="font-semibold">{patient.bloodType}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Contact Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        {patient.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-pink-500" />
                            {patient.email}
                          </p>
                        )}
                        {patient.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-pink-500" />
                            {patient.phone}
                          </p>
                        )}
                        {patient.address && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-pink-500" />
                            {patient.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Emergency Contact
                      </h3>
                      <div className="space-y-2 text-sm">
                        {patient.emergencyContactName && (
                          <p className="font-medium">{patient.emergencyContactName}</p>
                        )}
                        {patient.emergencyContactPhone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-pink-500" />
                            {patient.emergencyContactPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {patient.allergies && patient.allergies.length > 0 && (
                    <div className="mt-4 p-3 rounded-md bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Allergies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-sm rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-medium"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Upcoming Appointments
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {upcomingAppointments.length}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Prescriptions
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {activePrescriptions.length}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ongoing Treatments
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {upcomingTreatments.length}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="appointments" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
            </TabsList>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-blue-200 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    No Upcoming Appointments
                  </h3>
                  <p className="text-muted-foreground">
                    You don't have any appointments scheduled at the moment.
                  </p>
                </GlassCard>
              ) : (
                upcomingAppointments.map((apt) => (
                  <GlassCard key={apt.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg">
                          <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {apt.appointmentType}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Dr. {apt.doctorName}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                            <Clock className="w-3 h-3" />
                            {new Date(apt.appointmentDate).toLocaleString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {apt.reason && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              Reason: {apt.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  </GlassCard>
                ))
              )}
            </TabsContent>

            {/* Prescriptions Tab */}
            <TabsContent value="prescriptions" className="space-y-3">
              {activePrescriptions.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <Pill className="w-16 h-16 mx-auto text-purple-200 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    No Active Prescriptions
                  </h3>
                  <p className="text-muted-foreground">
                    You don't have any active prescriptions at the moment.
                  </p>
                </GlassCard>
              ) : (
                activePrescriptions.map((rx) => (
                  <GlassCard key={rx.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
                          <Pill className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {rx.medication}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rx.dosage} - {rx.frequency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {rx.duration}
                          </p>
                          {rx.instructions && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                              "{rx.instructions}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Prescribed by: Dr. {rx.prescribedByName}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={rx.status} />
                    </div>
                  </GlassCard>
                ))
              )}
            </TabsContent>

            {/* Treatments Tab */}
            <TabsContent value="treatments" className="space-y-3">
              {upcomingTreatments.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <Activity className="w-16 h-16 mx-auto text-emerald-200 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    No Ongoing Treatments
                  </h3>
                  <p className="text-muted-foreground">
                    You don't have any scheduled treatments at the moment.
                  </p>
                </GlassCard>
              ) : (
                upcomingTreatments.map((treatment) => (
                  <GlassCard key={treatment.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                          <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {treatment.treatmentType}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {treatment.description}
                          </p>
                          {treatment.diagnosis && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Diagnosis: {treatment.diagnosis}
                            </p>
                          )}
                          {treatment.scheduledDate && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                              <Clock className="w-3 h-3" />
                              {new Date(treatment.scheduledDate).toLocaleString()}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Assigned by: {treatment.createdByName}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <StatusBadge status={treatment.status} />
                        <StatusBadge status={treatment.priority} />
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </motion.div>
  );
}