import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wifi, Clock, Users, AlertTriangle, Phone, Mail, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PaymentOptions } from "./PaymentOptions";
import { UserManagement } from "./UserManagement";

interface User {
  id: string;
  name: string;
  phone: string;
  plan: "daily" | "weekly" | "monthly";
  status: "active" | "expired" | "warning";
  expiresAt: Date;
  connectedAt?: Date;
}

interface SystemStats {
  totalUsers: number;
  activeConnections: number;
  todayRevenue: number;
  totalRevenue: number;
}

export function WifiDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 45,
    activeConnections: 23,
    todayRevenue: 47000,
    totalRevenue: 850000
  });

  // Mock current user for demo
  useEffect(() => {
    // Simulate checking user status
    const mockUser: User = {
      id: "1",
      name: "Guest User",
      phone: "+256701234567",
      plan: "daily",
      status: "warning",
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    };
    setCurrentUser(mockUser);
  }, []);

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const remaining = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, total: remaining };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-wifi-connected text-white">Connected</Badge>;
      case "expired":
        return <Badge className="bg-wifi-disconnected text-white">Expired</Badge>;
      case "warning":
        return <Badge className="bg-warning text-white">Expires Soon</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handlePaymentSuccess = (plan: string) => {
    toast({
      title: "Payment Successful!",
      description: `Your ${plan} plan is now active. You will be connected automatically.`,
    });
    setShowPayment(false);
    // Update user status
    setCurrentUser(prev => prev ? {
      ...prev,
      status: "active",
      plan: plan as any,
      expiresAt: new Date(Date.now() + (plan === "daily" ? 24 : plan === "weekly" ? 168 : 720) * 60 * 60 * 1000)
    } : null);
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wifi className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">AroSoft WiFi</h1>
        </div>
        <p className="text-muted-foreground">Simple Internet Access for Everyone</p>
      </div>

      {/* Current User Status */}
      {currentUser && (
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Connection</CardTitle>
              {getStatusBadge(currentUser.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentUser.status === "warning" && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="font-medium text-warning">Connection Expiring Soon!</p>
                  {(() => {
                    const { hours, minutes } = getTimeRemaining(currentUser.expiresAt);
                    return (
                      <p className="text-sm text-muted-foreground">
                        {hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`} remaining
                      </p>
                    );
                  })()}
                </div>
              </div>
            )}
            
            {currentUser.status === "active" && (
              <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                <Wifi className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="font-medium text-success">Connected to Internet</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1)} plan active
                  </p>
                </div>
              </div>
            )}

            {currentUser.status === "expired" && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Clock className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Connection Expired</p>
                  <p className="text-sm text-muted-foreground">Purchase a plan to continue</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current Plan</p>
                <p className="font-medium">{currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expires</p>
                <p className="font-medium">{currentUser.expiresAt.toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          size="lg" 
          className="h-16 text-lg font-semibold bg-primary hover:bg-primary/90"
          onClick={() => setShowPayment(true)}
        >
          <Wifi className="mr-2 h-6 w-6" />
          Buy Internet Access
        </Button>
        
        <Button 
          size="lg" 
          variant="outline" 
          className="h-16 text-lg"
          onClick={() => setShowUserManagement(true)}
        >
          <Users className="mr-2 h-6 w-6" />
          Manage Users
        </Button>
      </div>

      {/* System Stats */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Current system statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-success">{stats.activeConnections}</p>
              <p className="text-sm text-muted-foreground">Active Now</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-warning">{stats.todayRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Today (UGX)</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-secondary">{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-muted-foreground">Total (UGX)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Contact our support team for assistance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Call Support</p>
              <p className="text-sm text-muted-foreground">+256787726388</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium">WhatsApp</p>
              <p className="text-sm text-muted-foreground">+256787726388</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-secondary" />
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-sm text-muted-foreground">support@arosoft.io</p>
            </div>
          </div>
          <div className="pt-2">
            <Button variant="outline" className="w-full">
              Visit arosoft.io/contact
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentOptions 
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* User Management Modal */}
      {showUserManagement && (
        <UserManagement 
          onClose={() => setShowUserManagement(false)}
        />
      )}
    </div>
  );
}