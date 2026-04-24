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
  Heart,
  Shield,
  TrendingUp,
  CheckCircle,
  ClipboardList,
  Stethoscope,
} from "lucide-react";
import type { Patient, Prescription, Treatment, Appointment } from "@shared/schema";
import { generatePatientPDF } from "@/lib/pdfExport";
import { useToast } from "@/hooks/use-toast";

export default function PatientPortal() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Static Sara Ouksel Patient ID
  const SARA_PATIENT_ID = "092aAL3U5mef3GVR57FA";

  // Fetch Sara's patient record (static)
  const { data: patient, isLoading: patientLoading } = useQuery<Patient | null>({
    queryKey: ["/api/patient/profile", SARA_PATIENT_ID],
    queryFn: async () => {
      return await patientsCollection.get(SARA_PATIENT_ID);
    },
  });

  // Fetch Sara's prescriptions (static)
  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery<
    Prescription[]
  >({
    queryKey: ["/api/patient/prescriptions", SARA_PATIENT_ID],
    queryFn: async () => {
      return await prescriptionsCollection.getByPatient(SARA_PATIENT_ID);
    },
  });

  // Fetch Sara's treatments (static)
  const { data: treatments = [], isLoading: treatmentsLoading } = useQuery<Treatment[]>({
    queryKey: ["/api/patient/treatments", SARA_PATIENT_ID],
    queryFn: async () => {
      return await treatmentsCollection.getByPatient(SARA_PATIENT_ID);
    },
  });

  // Fetch Sara's appointments (static)
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<
    Appointment[]
  >({
    queryKey: ["/api/patient/appointments", SARA_PATIENT_ID],
    queryFn: async () => {
      return await appointmentsCollection.getByPatient(SARA_PATIENT_ID);
    },
  });

  const isLoading =
    patientLoading ||
    prescriptionsLoading ||
    treatmentsLoading ||
    appointmentsLoading;

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

  const completedTreatments = treatments.filter(
    (t) => t.status === "completed"
  );

  const completedPrescriptions = prescriptions.filter(
    (rx) => rx.status === "completed"
  );

  const patientAge = patient
    ? Math.floor(
        (Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000
      )
    : 0;

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
          {/* Enhanced Patient Profile */}
          {patient && (
            <GlassCard className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24 border-4 border-blue-200/50">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-3xl font-bold">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {patient.firstName} {patient.lastName}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        {patientAge} years old • Patient ID: {patient.id.slice(0, 8)}
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={patient.status} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">
                        Personal Info
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="text-muted-foreground">DOB:</span>
                          <span className="font-medium">{patient.dateOfBirth}</span>
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-muted-foreground">Gender:</span>
                          <span className="font-medium capitalize">{patient.gender}</span>
                        </p>
                        {patient.bloodType && (
                          <p className="text-sm flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-red-500" />
                            <span className="text-muted-foreground">Blood Type:</span>
                            <span className="font-bold text-red-600">{patient.bloodType}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">
                        Contact Info
                      </h3>
                      <div className="space-y-2">
                        {patient.email && (
                          <p className="text-sm flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span className="truncate">{patient.email}</span>
                          </p>
                        )}
                        {patient.phone && (
                          <p className="text-sm flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-500" />
                            <span>{patient.phone}</span>
                          </p>
                        )}
                        {patient.address && (
                          <p className="text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-muted-foreground">{patient.address}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">
                        Emergency Contact
                      </h3>
                      <div className="space-y-2">
                        {patient.emergencyContactName ? (
                          <>
                            <p className="text-sm flex items-center gap-2">
                              <Shield className="w-4 h-4 text-red-500" />
                              <span className="font-medium">{patient.emergencyContactName}</span>
                            </p>
                            {patient.emergencyContactPhone && (
                              <p className="text-sm flex items-center gap-2">
                                <Phone className="w-4 h-4 text-red-500" />
                                <span>{patient.emergencyContactPhone}</span>
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {patient.allergies && patient.allergies.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Known Allergies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, i) => (
                          <span
                            key={i}
                            className="px-3 py-2 text-sm font-medium rounded-lg bg-amber-100 text-amber-700 border-2 border-amber-300 shadow-sm"
                          >
                            ⚠️ {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Medical History & Current Medications */}
          {patient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medical History */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <ClipboardList className="w-6 h-6 text-indigo-500" />
                  Medical History
                </h2>
                {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                  <div className="space-y-3">
                    {patient.medicalHistory.map((history, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {history}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No medical history recorded</p>
                )}
              </GlassCard>

              {/* Current Medications */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-500" />
                  Current Medications
                </h2>
                {patient.currentMedications && patient.currentMedications.length > 0 ? (
                  <div className="space-y-3">
                    {patient.currentMedications.map((medication, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800"
                      >
                        <Pill className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {medication}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No current medications</p>
                )}
              </GlassCard>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Records
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {prescriptions.length + treatments.length + appointments.length}
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

          {/* Medical History Section - Completed Treatments & Prescriptions */}
          {(completedTreatments.length > 0 || completedPrescriptions.length > 0) && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-gray-500" />
                Medical History - Completed Records
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Completed Treatments */}
                {completedTreatments.length > 0 && (
                  <GlassCard className="p-5">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Completed Treatments ({completedTreatments.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {completedTreatments.map((treatment) => (
                        <div
                          key={treatment.id}
                          className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                        >
                          <h4 className="font-medium text-sm text-gray-800 dark:text-white">
                            {treatment.treatmentType}
                          </h4>
                          {treatment.diagnosis && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {treatment.diagnosis}
                            </p>
                          )}
                          {treatment.completedDate && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <CheckCircle className="w-3 h-3" />
                              Completed: {new Date(treatment.completedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Completed Prescriptions */}
                {completedPrescriptions.length > 0 && (
                  <GlassCard className="p-5">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                      Completed Prescriptions ({completedPrescriptions.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {completedPrescriptions.map((rx) => (
                        <div
                          key={rx.id}
                          className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        >
                          <h4 className="font-medium text-sm text-gray-800 dark:text-white">
                            {rx.medication}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rx.dosage} - {rx.frequency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Duration: {rx.duration}
                          </p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </div>
            </div>
          )}

          {/* Health Summary */}
          {patient && (
            <GlassCard className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                Health Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {patient.medicalHistory?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Medical History Items</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600">
                    {patient.allergies?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Known Allergies</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-pink-600">
                    {patient.currentMedications?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Current Medications</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {prescriptions.length + treatments.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Medical Records</p>
                </div>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </motion.div>
  );
}