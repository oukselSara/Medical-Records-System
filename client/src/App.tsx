import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import { LoadingScreen } from "@/components/LoadingSpinner";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import Prescriptions from "@/pages/Prescriptions";
import Treatments from "@/pages/Treatments";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, firebaseUser, loading, isConfigured } = useAuth();

  // Debug logging
  console.log("🔍 Auth Debug:", {
    loading,
    isConfigured,
    hasFirebaseUser: !!firebaseUser,
    firebaseUserEmail: firebaseUser?.email,
    hasUser: !!user,
    userEmail: user?.email,
    userRole: user?.role,
  });

  // Show loading screen
  if (loading) {
    console.log("⏳ Still loading auth state...");
    return <LoadingScreen />;
  }

  // If Firebase is not configured, show warning but allow access
  if (!isConfigured) {
    console.warn("⚠️ Firebase not configured! Using demo mode.");
  }

  // Check if user is authenticated (check both firebaseUser and user)
  const isAuthenticated = firebaseUser && user;

  console.log(
    "✅ Authentication status:",
    isAuthenticated ? "LOGGED IN" : "NOT LOGGED IN",
  );

  // If no user, show auth routes (login/signup)
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/">
          {() => {
            console.log("🔄 Redirecting to login...");
            return <Redirect to="/login" />;
          }}
        </Route>
        <Route>{() => <Redirect to="/login" />}</Route>
      </Switch>
    );
  }

  // User is authenticated - show main app
  console.log("🎉 User authenticated! Showing main app.");

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full relative bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <FloatingOrbs />
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden relative z-10">
          <Header showSearch />
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/">{() => <Redirect to="/dashboard" />}</Route>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/patients" component={Patients} />
              <Route path="/patients/:id" component={Patients} />
              <Route path="/prescriptions" component={Prescriptions} />
              <Route path="/treatments" component={Treatments} />
              <Route path="/notifications" component={Notifications} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
