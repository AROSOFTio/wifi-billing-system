import { WifiDashboard } from "@/components/wifi/WifiDashboard";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";

const Index = () => {
  const { profile } = useAuth();
  
  if (profile?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  return <WifiDashboard />;
};

export default Index;
