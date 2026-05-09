import { useAuth } from "@/context/AuthContext";
import ParticipantDashboard from "./participant/ParticipantDashboard";
import DirectorDashboard from "./director/DirectorDashboard";

export default function DashboardRouter() {
  const { user } = useAuth();
  return user?.role === "Diretor" ? <DirectorDashboard /> : <ParticipantDashboard />;
}
