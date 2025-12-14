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
} from "lucide-react";
import type { Patient, Prescription, Treatment, Appointment } from "@shared/schema";
import { generatePatientPDF } from "@/lib/pdfExport";
import { useToast } from "@/hooks/use-toast";

export default function PatientPortal() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch patient's own record
  const { data: patient, isLoading: patientLoading } = useQuery<Patient | null>({
    queryKey: ["/api/patient/profile", user?.patientId],
    queryFn: async () => {
      if (!user?.patientId) return null;
      return await patientsCollection.get(user.patientId);
    },
    enabled: user?.role === "patient" && !!user?.patientId,
  });

  // Fetch patient's prescriptions
  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery<
    Prescription[]
  >({
    queryKey: ["/api/patient/prescriptions", user?.patientId],
    queryFn: async () => {
      if (!user?.patientId) return [];
      return await prescriptionsCollection.getByPatient(user.patientId);
    },
    enabled: user?.role === "patient" && !!user?.patientId,
  });

  // Fetch patient's treatments
  const { data: treatments = [], isLoading: treatmentsLoading } = useQuery<Treatment[]>({
    queryKey: ["/api/patient/treatments", user?.patientId],
    queryFn: async () => {
      if (!user?.patientId) return [];
      return await treatmentsCollection.getByPatient(user.patientId);
    },
    enabled: user?.role === "patient" && !!user?.patientId,
  });

  // Fetch patient's appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<
    Appointment[]
  >({
    queryKey: ["/api/patient/appointments", user?.patientId],
    queryFn: async () => {
      if (!user?.patientId) return [];
      return await appointmentsCollection.getByPatient(user.patientId);
    },
    enabled: user?.role === "patient" && !!user?.patientId,
  });

  const isLoading =
    patientLoading ||
    prescriptionsLoading ||
    treatmentsLoading ||
    appointmentsLoading;

  // Redirect if not a patient
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
          <p className="text-muted-foreground">
            Your account is not linked to a patient record. Please contact the
            administrator.
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
    (apt) =>
      apt.status === "scheduled" || apt.status === "confirmed"
  );

  const activePrescriptions = prescriptions.filter(
    (rx) => rx.status === "active" || rx.status === "pending"
  );

  const upcomingTreatments = treatments.filter(
    (t) => t.status === "scheduled" || t.status === "in-progress"
  );

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
            <User className="w-8 h-8 text-blue-500" />
            My Health Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            View your medical records and appointments
          </p>
        </div>
        {patient && (
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Medical Records
          </Button>
        )}
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : (
        <>
          {/* Patient Profile */}
          {patient && (
            <GlassCard className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20 border-4 border-blue-200/50">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-2xl font-bold">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {patient.firstName} {patient.lastName}
                      </h2>
                      <StatusBadge status={patient.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date of Birth: {patient.dateOfBirth}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Gender: {patient.gender}
                      </p>
                      {patient.bloodType && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-red-400" />
                          Blood Type: {patient.bloodType}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      {patient.email && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {patient.email}
                        </p>
                      )}
                      {patient.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {patient.phone}
                        </p>
                      )}
                      {patient.address && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {patient.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {patient.allergies && patient.allergies.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Allergies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-sm rounded-md bg-amber-100 text-amber-700 border border-amber-200"
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

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                Upcoming Appointments
              </h2>
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <GlassCard key={apt.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {apt.appointmentType}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Dr. {apt.doctorName}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3" />
                          {new Date(apt.appointmentDate).toLocaleString()}
                        </p>
                        {apt.reason && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {apt.reason}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Active Prescriptions */}
          {activePrescriptions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Pill className="w-6 h-6 text-purple-500" />
                Active Prescriptions
              </h2>
              <div className="space-y-3">
                {activePrescriptions.map((rx) => (
                  <GlassCard key={rx.id} className="p-5">
                    <div className="flex items-start justify-between">
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
                          Prescribed by: {rx.prescribedByName}
                        </p>
                      </div>
                      <StatusBadge status={rx.status} />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Ongoing Treatments */}
          {upcomingTreatments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-500" />
                Ongoing Treatments
              </h2>
              <div className="space-y-3">
                {upcomingTreatments.map((treatment) => (
                  <GlassCard key={treatment.id} className="p-5">
                    <div className="flex items-start justify-between">
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
                      <div className="flex flex-col gap-2 items-end">
                        <StatusBadge status={treatment.status} />
                        <StatusBadge status={treatment.priority} />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}