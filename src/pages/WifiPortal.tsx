import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { PaymentOptions } from '@/components/wifi/PaymentOptions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration_hours: number;
  price: number;
}

interface DeviceSubscription {
  id: string;
  status: string;
  expires_at: string | null;
  plan_id: string;
}

export function WifiPortal() {
  const [deviceId, setDeviceId] = useState<string>('');
  const [subscription, setSubscription] = useState<DeviceSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Generate or get device ID
  useEffect(() => {
    let storedDeviceId = localStorage.getItem('wifi_device_id');
    if (!storedDeviceId) {
      storedDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('wifi_device_id', storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  // Check subscription status
  useEffect(() => {
    if (!deviceId) return;

    const checkSubscription = async () => {
      try {
        const { data: activeSubscription } = await supabase
          .from('device_subscriptions')
          .select('*')
          .eq('device_id', deviceId)
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString())
          .single();

        setSubscription(activeSubscription);
        setLoading(false);
      } catch (error) {
        console.log('No active subscription found');
        setLoading(false);
      }
    };

    checkSubscription();
  }, [deviceId]);

  // Load subscription plans
  useEffect(() => {
    const loadPlans = async () => {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('duration_hours', { ascending: true });
      
      if (data) setPlans(data);
    };

    loadPlans();
  }, []);

  // Update time remaining
  useEffect(() => {
    if (!subscription?.expires_at) return;

    const updateTime = () => {
      const now = new Date();
      const expiresAt = new Date(subscription.expires_at!);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setSubscription(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m remaining`);

      // Show warning 2 hours before expiry
      if (diff <= 2 * 60 * 60 * 1000 && diff > 2 * 60 * 60 * 1000 - 5000) {
        toast({
          title: 'Subscription Expiring Soon',
          description: 'Your internet access will expire in 2 hours. Please renew to continue.',
          variant: 'destructive',
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [subscription]);

  const handlePaymentSuccess = () => {
    // Refresh subscription status
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Wifi className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Checking connection status...</p>
        </div>
      </div>
    );
  }

  // If user has active subscription, show connected status
  if (subscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wifi className="h-8 w-8 text-green-500" />
              <h1 className="text-3xl font-bold text-foreground">AroSoft WiFi</h1>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-500 font-medium">Connected</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">{timeRemaining}</p>
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(subscription.expires_at!).toLocaleString()}
                </p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Need Support?</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>📞 Call: +256787726388</p>
                  <p>💬 WhatsApp: +256787726388</p>
                  <p>📧 Email: support@arosoft.io</p>
                  <p>🌐 Visit: arosoft.io/contact</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setSubscription(null)}
              className="w-full"
            >
              Extend Subscription
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show payment options if no active subscription
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wifi className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">AroSoft WiFi</h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span className="text-orange-500 font-medium">Not Connected</span>
          </div>
          <p className="text-muted-foreground">Choose a plan to get connected</p>
        </div>

        <PaymentOptions 
          plans={plans} 
          deviceId={deviceId}
          onPaymentSuccess={handlePaymentSuccess}
        />

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h4 className="font-medium">Need Support?</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>📞 Call: +256787726388</p>
                <p>💬 WhatsApp: +256787726388</p>
                <p>📧 Email: support@arosoft.io</p>
                <p>🌐 Visit: arosoft.io/contact</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}