import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Wifi, Clock, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DeviceSubscription {
  id: string;
  device_id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
  subscription_plans: {
    name: string;
    price: number;
  };
}

interface DevicePayment {
  id: string;
  device_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  metadata?: any;
}

export function UserManagement() {
  const [subscriptions, setSubscriptions] = useState<DeviceSubscription[]>([]);
  const [payments, setPayments] = useState<DevicePayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load device subscriptions
      const { data: subsData } = await supabase
        .from('device_subscriptions')
        .select(`
          *,
          subscription_plans (name, price)
        `)
        .order('created_at', { ascending: false });

      // Load device payments
      const { data: paymentsData } = await supabase
        .from('device_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsData) setSubscriptions(subsData);
      if (paymentsData) setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectDevice = async (subscriptionId: string, deviceId: string) => {
    try {
      const { error } = await supabase
        .from('device_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: 'Device Disconnected',
        description: `Device ${deviceId} has been disconnected`,
      });

      loadData();
    } catch (error) {
      console.error('Error disconnecting device:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect device',
        variant: 'destructive',
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.device_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    } else if (isExpired) {
      return <Badge variant="secondary">Expired</Badge>;
    } else if (status === 'active') {
      return <Badge variant="default">Active</Badge>;
    } else {
      return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Wifi className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Connected Devices
          </CardTitle>
          <CardDescription>
            Manage device subscriptions and monitor usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by device ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time Remaining</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No devices found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-mono text-sm">
                        {subscription.device_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {subscription.subscription_plans?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            UGX {subscription.subscription_plans?.price}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status, subscription.expires_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {getTimeRemaining(subscription.expires_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTime(subscription.expires_at)}
                      </TableCell>
                      <TableCell>
                        {subscription.status === 'active' && 
                         new Date(subscription.expires_at) > new Date() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnectDevice(subscription.id, subscription.device_id)}
                            className="flex items-center gap-1"
                          >
                            <Ban className="h-4 w-4" />
                            Disconnect
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Track all payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, 10).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">
                      {payment.device_id}
                    </TableCell>
                    <TableCell>UGX {payment.amount}</TableCell>
                    <TableCell className="capitalize">
                      {payment.payment_method}
                    </TableCell>
                    <TableCell>
                      {payment.metadata?.phone_number || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          payment.status === 'completed' 
                            ? 'default' 
                            : payment.status === 'failed' 
                            ? 'destructive' 
                            : 'outline'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatTime(payment.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}