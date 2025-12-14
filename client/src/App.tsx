// client/src/App.tsx
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
import Admin from "@/pages/Admin";
import PatientPortal from "@/pages/PatientPortal";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, firebaseUser, loading, isConfigured } = useAuth();

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // If Firebase is not configured, show warning but allow access
  if (!isConfigured) {
    console.warn("⚠️ Firebase not configured! Using demo mode.");
  }

  // Check if user is authenticated
  const isAuthenticated = firebaseUser && user;

  // If no user, show auth routes
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/">
          <Redirect to="/login" />
        </Route>
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

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
              {/* Default route based on role */}
              <Route path="/">
                {() => {
                  if (user?.role === "patient") {
                    return <Redirect to="/patient-portal" />;
                  }
                  return <Redirect to="/dashboard" />;
                }}
              </Route>

              {/* Admin routes */}
              <Route path="/admin">
                {() => {
                  if (user?.role !== "admin") {
                    return <Redirect to="/dashboard" />;
                  }
                  return <Admin />;
                }}
              </Route>

              {/* Patient routes */}
              <Route path="/patient-portal">
                {() => {
                  if (user?.role !== "patient") {
                    return <Redirect to="/dashboard" />;
                  }
                  return <PatientPortal />;
                }}
              </Route>

              {/* Staff routes (admin, doctor, nurse) */}
              <Route path="/dashboard">
                {() => {
                  if (user?.role === "patient") {
                    return <Redirect to="/patient-portal" />;
                  }
                  return <Dashboard />;
                }}
              </Route>

              <Route path="/patients">
                {() => {
                  if (
                    user?.role !== "admin" &&
                    user?.role !== "doctor" &&
                    user?.role !== "nurse"
                  ) {
                    return <Redirect to="/" />;
                  }
                  return <Patients />;
                }}
              </Route>

              <Route path="/patients/:id">
                {() => {
                  if (
                    user?.role !== "admin" &&
                    user?.role !== "doctor" &&
                    user?.role !== "nurse"
                  ) {
                    return <Redirect to="/" />;
                  }
                  return <Patients />;
                }}
              </Route>

              <Route path="/prescriptions">
                {() => {
                  if (
                    user?.role !== "admin" &&
                    user?.role !== "doctor" &&
                    user?.role !== "pharmacist"
                  ) {
                    return <Redirect to="/" />;
                  }
                  return <Prescriptions />;
                }}
              </Route>

              <Route path="/treatments">
                {() => {
                  if (
                    user?.role !== "admin" &&
                    user?.role !== "doctor" &&
                    user?.role !== "nurse"
                  ) {
                    return <Redirect to="/" />;
                  }
                  return <Treatments />;
                }}
              </Route>

              {/* Accessible to all authenticated users */}
              <Route path="/notifications" component={Notifications} />

              {/* 404 */}
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