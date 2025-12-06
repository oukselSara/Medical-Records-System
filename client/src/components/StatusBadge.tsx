import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = 
  | "active" | "inactive" | "critical" 
  | "pending" | "completed" | "cancelled"
  | "scheduled" | "in-progress"
  | "low" | "medium" | "high" | "urgent";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-600 border-gray-200" },
  critical: { label: "Critical", className: "bg-red-100 text-red-700 border-red-200" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600 border-gray-200" },
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 border-blue-200" },
  "in-progress": { label: "In Progress", className: "bg-pink-100 text-pink-700 border-pink-200" },
  low: { label: "Low", className: "bg-gray-100 text-gray-600 border-gray-200" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 border-amber-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: "doctor" | "nurse" | "pharmacist" }) {
  const roleConfig = {
    doctor: { label: "Doctor", className: "bg-purple-100 text-purple-700 border-purple-200" },
    nurse: { label: "Nurse", className: "bg-blue-100 text-blue-700 border-blue-200" },
    pharmacist: { label: "Pharmacist", className: "bg-teal-100 text-teal-700 border-teal-200" },
  };
  
  const config = roleConfig[role];
  
  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium border", config.className)}
    >
      {config.label}
    </Badge>
  );
}
