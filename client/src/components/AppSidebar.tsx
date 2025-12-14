// client/src/components/AppSidebar.tsx
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/StatusBadge";
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Bell,
  Settings,
  LogOut,
  Heart,
  Pill,
  Stethoscope,
  ClipboardList,
  Shield,
  User,
  Calendar,
} from "lucide-react";
import type { UserRole } from "@shared/schema";

const menuItems = {
  admin: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "User Management", url: "/admin", icon: Shield },
    { title: "Patients", url: "/patients", icon: Users },
    { title: "Prescriptions", url: "/prescriptions", icon: Pill },
    { title: "Treatments", url: "/treatments", icon: Activity },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ],
  doctor: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Patients", url: "/patients", icon: Users },
    { title: "Prescriptions", url: "/prescriptions", icon: Pill },
    { title: "Treatments", url: "/treatments", icon: Activity },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ],
  nurse: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Patients", url: "/patients", icon: Users },
    { title: "Treatments", url: "/treatments", icon: Activity },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ],
  pharmacist: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Prescriptions", url: "/prescriptions", icon: Pill },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ],
  patient: [
    { title: "My Portal", url: "/patient-portal", icon: User },
    { title: "Appointments", url: "/patient-appointments", icon: Calendar },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ],
};

export function AppSidebar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  if (!user) return null;

  const items = menuItems[user.role] || menuItems.doctor;

  return (
    <Sidebar className="border-r border-pink-100/50 dark:border-pink-900/30 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-pink-100/30 dark:border-pink-900/20">
        <Link href="/">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-200/40">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800 dark:text-white">MedRecord</h1>
              <p className="text-xs text-muted-foreground">EMR System</p>
            </div>
          </motion.div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-pink-600/70 dark:text-pink-400/70 px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? "bg-pink-100/60 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300" : ""}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/ /g, '-')}`}>
                        <item.icon className={isActive ? "text-pink-600" : ""} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-pink-100/30 dark:border-pink-900/20">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10 border-2 border-pink-200/50">
            <AvatarImage src={user.photoURL} alt={user.displayName} />
            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white">
              {user.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
              {user.displayName}
            </p>
            <RoleBadge role={user.role} />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          data-testid="button-signout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}