import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "@/components/StatusBadge";
import { Bell, Search, Settings, LogOut, User, Sun, Moon } from "lucide-react";
import type { UserRole } from "@shared/schema";

interface HeaderProps {
  onSearch?: (term: string) => void;
  showSearch?: boolean;
}

export function Header({ onSearch, showSearch = false }: HeaderProps) {
  const { user, signOut, updateUserRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleRoleChange = (role: string) => {
    updateUserRole(role as UserRole);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-3 border-b border-pink-100/50 dark:border-pink-900/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            className="relative hidden md:block"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients, prescriptions..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-80 pl-10 bg-white/50 dark:bg-gray-800/50 border-pink-100/50 dark:border-pink-900/30 focus:border-pink-300 dark:focus:border-pink-700"
              data-testid="input-search"
            />
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Select value={user?.role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-32 bg-white/50 dark:bg-gray-800/50 border-pink-100/50" data-testid="select-role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="doctor">Doctor</SelectItem>
            <SelectItem value="nurse">Nurse</SelectItem>
            <SelectItem value="pharmacist">Pharmacist</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-pink-600"
          data-testid="button-theme-toggle"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex items-center gap-2 px-2"
              data-testid="button-user-menu"
            >
              <Avatar className="w-8 h-8 border border-pink-200/50">
                <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-sm">
                  {user?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-pink-100/50 dark:border-pink-900/30">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-pink-100/50 dark:bg-pink-900/30" />
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-pink-100/50 dark:bg-pink-900/30" />
            <DropdownMenuItem
              className="cursor-pointer text-red-600"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
