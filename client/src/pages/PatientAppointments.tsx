// client/src/pages/PatientAppointments.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Plus, Video } from "lucide-react";
import { motion } from "framer-motion";

interface Appointment {
  id: number;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  type: "in-person" | "virtual";
  location: string;
  status: "upcoming" | "completed" | "cancelled";
}

// Demo appointments for Sara Johnson
const appointments: Appointment[] = [
  {
    id: 1,
    date: "2024-01-25",
    time: "10:00 AM",
    doctor: "Dr. Sarah Mitchell",
    specialty: "Cardiology",
    type: "in-person",
    location: "Building A, Room 302",
    status: "upcoming",
  },
  {
    id: 2,
    date: "2024-02-05",
    time: "2:30 PM",
    doctor: "Dr. James Chen",
    specialty: "Primary Care",
    type: "virtual",
    location: "Video Call",
    status: "upcoming",
  },
  {
    id: 3,
    date: "2023-12-15",
    time: "9:00 AM",
    doctor: "Dr. Sarah Mitchell",
    specialty: "Cardiology",
    type: "in-person",
    location: "Building A, Room 302",
    status: "completed",
  },
];

export default function PatientAppointments() {
  const upcomingAppointments = appointments.filter((apt) => apt.status === "upcoming");
  const pastAppointments = appointments.filter((apt) => apt.status === "completed");

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "completed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "";
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <motion.div variants={item}>
      <Card className="hover:shadow-lg transition-all duration-300 border-pink-100/50 dark:border-pink-900/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{appointment.doctor}</CardTitle>
              <CardDescription>{appointment.specialty}</CardDescription>
            </div>
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-pink-500" />
            <span>{new Date(appointment.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-pink-500" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {appointment.type === "virtual" ? (
              <Video className="w-4 h-4 text-pink-500" />
            ) : (
              <MapPin className="w-4 h-4 text-pink-500" />
            )}
            <span>{appointment.location}</span>
          </div>
          {appointment.status === "upcoming" && (
            <div className="flex gap-2 mt-4">
              {appointment.type === "virtual" && (
                <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                  <Video className="w-4 h-4 mr-2" />
                  Join Call
                </Button>
              )}
              <Button variant="outline" className="flex-1">
                Reschedule
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming and past appointments</p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
          <Plus className="w-4 h-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upcoming Appointments ({upcomingAppointments.length})
          </h2>
          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <Card className="border-pink-100/50 dark:border-pink-900/30 bg-white/80 dark:bg-gray-900/80">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-16 h-16 text-pink-300 dark:text-pink-700 mb-4" />
                <p className="text-muted-foreground text-center">
                  No upcoming appointments scheduled
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Past Appointments
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
