import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClinicProvider } from "@/contexts/ClinicContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const DoseRegister = lazy(() => import("./pages/DoseRegister"));
const Patients = lazy(() => import("./pages/Patients"));
const Medications = lazy(() => import("./pages/Medications"));
const History = lazy(() => import("./pages/History"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Appointments = lazy(() => import("./pages/Appointments"));
const ClinicPage = lazy(() => import("./pages/Clinic"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ClinicProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <SpeedInsights />
              <VercelAnalytics />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dose"
                      element={
                        <ProtectedRoute>
                          <DoseRegister />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/patients"
                      element={
                        <ProtectedRoute>
                          <Patients />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/appointments"
                      element={
                        <ProtectedRoute>
                          <Appointments />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/medications"
                      element={
                        <ProtectedRoute>
                          <Medications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/history"
                      element={
                        <ProtectedRoute>
                          <History />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute>
                          <Reports />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clinic"
                      element={
                        <ProtectedRoute>
                          <ClinicPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </ClinicProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
