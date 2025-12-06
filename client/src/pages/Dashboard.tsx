import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { patientsCollection, prescriptionsCollection, treatmentsCollection } from "@/lib/firestore";
import { GlassCard } from "@/components/GlassCard";
import { SkeletonCard } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Users,
  Pill,
  Activity,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  FileText,
} from "lucide-react";
import type { Patient, Prescription, Treatment } from "@shared/schema";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: patients = [], isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    queryFn: () => patientsCollection.getAll(),
  });

  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
    queryFn: () => prescriptionsCollection.getAll(),
  });

  const { data: treatments = [], isLoading: treatmentsLoading } = useQuery<Treatment[]>({
    queryKey: ["/api/treatments"],
    queryFn: () => treatmentsCollection.getAll(),
  });

  const isLoading = patientsLoading || prescriptionsLoading || treatmentsLoading;

  const stats = [
    {
      label: "Total Patients",
      value: patients.length,
      icon: Users,
      gradient: "from-pink-500 to-rose-500",
      change: "+12%",
    },
    {
      label: "Active Prescriptions",
      value: prescriptions.filter((p) => p.status === "active" || p.status === "pending").length,
      icon: Pill,
      gradient: "from-purple-500 to-pink-500",
      change: "+8%",
    },
    {
      label: "Ongoing Treatments",
      value: treatments.filter((t) => t.status === "in-progress" || t.status === "scheduled").length,
      icon: Activity,
      gradient: "from-blue-500 to-purple-500",
      change: "+5%",
    },
    {
      label: "Critical Cases",
      value: patients.filter((p) => p.status === "critical").length,
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-500",
      change: "-2%",
    },
  ];

  const recentPatients = patients.slice(0, 5);
  const recentPrescriptions = prescriptions.slice(0, 5);
  const upcomingTreatments = treatments
    .filter((t) => t.status === "scheduled")
    .slice(0, 5);

  const roleWelcome = {
    doctor: "Ready to provide excellent patient care today.",
    nurse: "Your patients are waiting for your compassionate care.",
    pharmacist: "Prescriptions are ready for your review.",
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Welcome back, {user?.displayName?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {roleWelcome[user?.role || "doctor"]}
        </p>
      </motion.div>

      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : stats.map((stat, index) => (
              <GlassCard key={stat.label} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs text-emerald-600">{stat.change}</span>
                      <span className="text-xs text-muted-foreground">vs last week</span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-br ${stat.gradient} shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </GlassCard>
            ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(user?.role === "doctor" || user?.role === "nurse") && (
          <motion.div variants={item} className="lg:col-span-1">
            <GlassCard className="p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-500" />
                  Recent Patients
                </h2>
                <Link href="/patients">
                  <Button variant="ghost" size="sm" className="text-pink-600" data-testid="link-view-all-patients">
                    View all <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-pink-50/50 rounded-md animate-pulse" />
                  ))}
                </div>
              ) : recentPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-pink-200 mb-3" />
                  <p className="text-muted-foreground">No patients yet</p>
                  <Link href="/patients">
                    <Button size="sm" className="mt-3 bg-pink-500 hover:bg-pink-600" data-testid="button-add-first-patient">
                      <Plus className="w-4 h-4 mr-1" /> Add First Patient
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPatients.map((patient) => (
                    <Link key={patient.id} href={`/patients/${patient.id}`}>
                      <motion.div
                        className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-pink-50/50 dark:hover:bg-pink-950/20 transition-colors"
                        whileHover={{ x: 4 }}
                        data-testid={`patient-card-${patient.id}`}
                      >
                        <Avatar className="w-10 h-10 border border-pink-100">
                          <AvatarFallback className="bg-gradient-to-br from-pink-200 to-rose-300 text-pink-700">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-800 dark:text-white truncate">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {patient.bloodType || "Blood type unknown"}
                          </p>
                        </div>
                        <StatusBadge status={patient.status} />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {(user?.role === "doctor" || user?.role === "pharmacist") && (
          <motion.div variants={item} className="lg:col-span-1">
            <GlassCard className="p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Pill className="w-5 h-5 text-purple-500" />
                  Prescriptions
                </h2>
                <Link href="/prescriptions">
                  <Button variant="ghost" size="sm" className="text-pink-600" data-testid="link-view-all-prescriptions">
                    View all <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-pink-50/50 rounded-md animate-pulse" />
                  ))}
                </div>
              ) : recentPrescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 mx-auto text-pink-200 mb-3" />
                  <p className="text-muted-foreground">No prescriptions yet</p>
                  {user?.role === "doctor" && (
                    <Link href="/prescriptions">
                      <Button size="sm" className="mt-3 bg-pink-500 hover:bg-pink-600" data-testid="button-create-prescription">
                        <Plus className="w-4 h-4 mr-1" /> Create Prescription
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPrescriptions.map((rx) => (
                    <motion.div
                      key={rx.id}
                      className="p-3 rounded-md bg-purple-50/30 dark:bg-purple-950/10 border border-purple-100/30 dark:border-purple-900/20"
                      whileHover={{ scale: 1.02 }}
                      data-testid={`prescription-card-${rx.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-800 dark:text-white">
                            {rx.medication}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rx.patientName} - {rx.dosage}
                          </p>
                        </div>
                        <StatusBadge status={rx.status} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {(user?.role === "doctor" || user?.role === "nurse") && (
          <motion.div variants={item} className="lg:col-span-1">
            <GlassCard className="p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Upcoming Treatments
                </h2>
                <Link href="/treatments">
                  <Button variant="ghost" size="sm" className="text-pink-600" data-testid="link-view-all-treatments">
                    View all <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-pink-50/50 rounded-md animate-pulse" />
                  ))}
                </div>
              ) : upcomingTreatments.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto text-pink-200 mb-3" />
                  <p className="text-muted-foreground">No scheduled treatments</p>
                  {user?.role === "doctor" && (
                    <Link href="/treatments">
                      <Button size="sm" className="mt-3 bg-pink-500 hover:bg-pink-600" data-testid="button-schedule-treatment">
                        <Plus className="w-4 h-4 mr-1" /> Schedule Treatment
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTreatments.map((treatment) => (
                    <motion.div
                      key={treatment.id}
                      className="p-3 rounded-md bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/30 dark:border-blue-900/20"
                      whileHover={{ scale: 1.02 }}
                      data-testid={`treatment-card-${treatment.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-800 dark:text-white">
                            {treatment.treatmentType}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {treatment.scheduledDate
                              ? new Date(treatment.scheduledDate).toLocaleDateString()
                              : "Not scheduled"}
                          </p>
                        </div>
                        <StatusBadge status={treatment.priority} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </div>

      {user?.role === "doctor" && (
        <motion.div variants={item}>
          <GlassCard className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-pink-500" />
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/patients">
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" data-testid="button-new-patient">
                  <Plus className="w-4 h-4 mr-2" /> New Patient
                </Button>
              </Link>
              <Link href="/prescriptions">
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50" data-testid="button-new-prescription">
                  <Pill className="w-4 h-4 mr-2" /> New Prescription
                </Button>
              </Link>
              <Link href="/treatments">
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50" data-testid="button-new-treatment">
                  <Activity className="w-4 h-4 mr-2" /> New Treatment
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
