import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, Clock, AlertTriangle, Phone, Mail, MessageCircle, CheckCircle, Calendar, CalendarDays } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PaymentOptions } from "@/components/wifi/PaymentOptions";

interface ConnectionStatus {
  isConnected: boolean;
  subscription?: {
    plan: string;
    expiresAt: string;
    timeRemaining: {
      hours: number;
      minutes: number;
    };
  };
}

export function WifiPortal() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ isConnected: false });
  const [showPayment, setShowPayment] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    // Generate device ID for tracking payments
    const storedDeviceId = localStorage.getItem('wifi_device_id');
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    } else {
      const newDeviceId = generateDeviceId();
      localStorage.setItem('wifi_device_id', newDeviceId);
      setDeviceId(newDeviceId);
    }

    checkConnectionStatus();
  }, [deviceId]);

  const generateDeviceId = () => {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const checkConnectionStatus = async () => {
    if (!deviceId) return;

    try {
      // Check if device has active subscription
      const response = await fetch(`/api/check-device-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });

      if (response.ok) {
        const status = await response.json();
        setConnectionStatus(status);
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const remaining = expiry.getTime() - now.getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, total: remaining };
  };

  const handlePaymentSuccess = (plan: string) => {
    toast({
      title: "Payment Successful!",
      description: `Your ${plan} is now active. Connecting to internet...`,
    });
    setShowPayment(false);
    // Refresh connection status
    setTimeout(() => checkConnectionStatus(), 2000);
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

      {/* Connection Status */}
      {connectionStatus.isConnected ? (
        <Card className="border-2 border-success/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Connection</CardTitle>
              <Badge className="bg-success text-white">Connected</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
              <div className="flex-1">
                <p className="font-medium text-success">Connected to Internet</p>
                <p className="text-sm text-muted-foreground">
                  {connectionStatus.subscription?.plan} active
                </p>
              </div>
            </div>

            {connectionStatus.subscription && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Plan</p>
                  <p className="font-medium">{connectionStatus.subscription.plan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time Remaining</p>
                  <p className="font-medium">
                    {connectionStatus.subscription.timeRemaining.hours}h {connectionStatus.subscription.timeRemaining.minutes}m
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-warning/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Internet Access Required</CardTitle>
              <Badge variant="outline">Not Connected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg mb-4">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div className="flex-1">
                <p className="font-medium text-warning">No Internet Access</p>
                <p className="text-sm text-muted-foreground">Purchase a plan to get connected instantly</p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-16 text-lg font-semibold bg-primary hover:bg-primary/90"
              onClick={() => setShowPayment(true)}
            >
              <Wifi className="mr-2 h-6 w-6" />
              Buy Internet Access
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plans Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that works best for you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">UGX 1,000</p>
              <p className="text-sm text-muted-foreground">Daily Plan</p>
              <p className="text-xs text-muted-foreground">24 Hours</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg border-2 border-secondary">
              <Calendar className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-secondary">UGX 5,000</p>
              <p className="text-sm text-muted-foreground">Weekly Plan</p>
              <p className="text-xs text-muted-foreground">7 Days</p>
              <Badge variant="secondary" className="mt-1 text-xs">Popular</Badge>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <CalendarDays className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">UGX 18,000</p>
              <p className="text-sm text-muted-foreground">Monthly Plan</p>
              <p className="text-xs text-muted-foreground">30 Days</p>
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
          deviceId={deviceId}
        />
      )}
    </div>
  );
}