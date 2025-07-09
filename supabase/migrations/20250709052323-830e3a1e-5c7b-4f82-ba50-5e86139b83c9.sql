
-- Create device-based payment and subscription tables
CREATE TABLE public.device_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'UGX',
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.device_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT DEFAULT 'pending',
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access to device tables
CREATE POLICY "Admins can view all device payments" 
ON public.device_payments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can update all device payments" 
ON public.device_payments 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can view all device subscriptions" 
ON public.device_subscriptions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can update all device subscriptions" 
ON public.device_subscriptions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Allow public insert for device payments (from edge functions)
CREATE POLICY "Allow device payment creation" 
ON public.device_payments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow device subscription creation" 
ON public.device_subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_device_payments_updated_at
BEFORE UPDATE ON public.device_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_subscriptions_updated_at
BEFORE UPDATE ON public.device_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update subscription plans with exact pricing
INSERT INTO public.subscription_plans (name, duration_hours, price) VALUES
('Daily Plan', 24, 1000),
('Weekly Plan', 168, 5000),
('Monthly Plan', 720, 18000)
ON CONFLICT DO NOTHING;
