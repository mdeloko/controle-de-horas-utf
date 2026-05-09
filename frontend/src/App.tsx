import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import DashboardRouter from "./pages/DashboardRouter";
import RegisterHours from "./pages/participant/RegisterHours";
import History from "./pages/participant/History";
import Validation from "./pages/director/Validation";
import ManualAssign from "./pages/director/ManualAssign";
import ParticipantsPage from "./pages/director/Participants";
import ActivityTypesPage from "./pages/director/ActivityTypes";
import Reports from "./pages/director/Reports";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="bottom-right" richColors />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardRouter />} />
              <Route path="registrar" element={<RegisterHours />} />
              <Route path="historico" element={<History />} />
              <Route path="validacao" element={<Validation />} />
              <Route path="atribuir" element={<ManualAssign />} />
              <Route path="participantes" element={<ParticipantsPage />} />
              <Route path="tipos" element={<ActivityTypesPage />} />
              <Route path="relatorios" element={<Reports />} />
              <Route path="perfil" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
