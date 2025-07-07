import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Smartphone, 
  CreditCard, 
  Clock, 
  Calendar, 
  CalendarDays, 
  X,
  CheckCircle 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentOptionsProps {
  onClose: () => void;
  onPaymentSuccess: (plan: string) => void;
}

interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: "daily",
    name: "Daily Plan",
    duration: "24 Hours",
    price: 1000,
    icon: <Clock className="h-6 w-6" />,
  },
  {
    id: "weekly", 
    name: "Weekly Plan",
    duration: "7 Days",
    price: 5000,
    popular: true,
    icon: <Calendar className="h-6 w-6" />,
  },
  {
    id: "monthly",
    name: "Monthly Plan", 
    duration: "30 Days",
    price: 18000,
    icon: <CalendarDays className="h-6 w-6" />,
  },
];

const paymentMethods = [
  {
    id: "mtn",
    name: "MTN Mobile Money",
    icon: "📱",
    color: "bg-mtn",
    instructions: "Dial *165# and follow the prompts",
  },
  {
    id: "airtel",
    name: "Airtel Money", 
    icon: "📞",
    color: "bg-airtel",
    instructions: "Dial *185# and follow the prompts",
  },
  {
    id: "visa",
    name: "Visa/Mastercard",
    icon: "💳", 
    color: "bg-visa",
    instructions: "Enter your card details securely",
  },
  {
    id: "wallet",
    name: "Mobile Wallet",
    icon: "💰",
    color: "bg-secondary",
    instructions: "Use any supported mobile wallet",
  },
];

export function PaymentOptions({ onClose, onPaymentSuccess }: PaymentOptionsProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentSelect = (methodId: string) => {
    setSelectedPayment(methodId);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !selectedPayment) {
      toast({
        title: "Missing Information",
        description: "Please select a plan and payment method",
        variant: "destructive",
      });
      return;
    }

    if ((selectedPayment === "mtn" || selectedPayment === "airtel") && !phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number for mobile money payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Payment Successful!",
        description: `Your ${selectedPlan.name} has been activated. You will be connected automatically.`,
      });
      
      onPaymentSuccess(selectedPlan.id);
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Internet Plan</DialogTitle>
          <DialogDescription>
            Select a plan and payment method to get connected instantly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">1. Select Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPlan?.id === plan.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border"
                  } ${plan.popular ? "border-2 border-secondary" : ""}`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan.popular && (
                    <div className="bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 rounded-b-md text-center">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                      {plan.icon}
                    </div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.duration}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      UGX {plan.price.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      High-speed internet access
                    </p>
                    {selectedPlan?.id === plan.id && (
                      <CheckCircle className="h-6 w-6 text-primary mx-auto mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          {selectedPlan && (
            <div>
              <h3 className="text-lg font-semibold mb-4">2. Choose Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPayment === method.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border"
                    }`}
                    onClick={() => handlePaymentSelect(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${method.color} flex items-center justify-center text-white text-xl`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{method.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {method.instructions}
                          </p>
                        </div>
                        {selectedPayment === method.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Phone Number Input for Mobile Money */}
          {selectedPayment && (selectedPayment === "mtn" || selectedPayment === "airtel") && (
            <div>
              <h3 className="text-lg font-semibold mb-4">3. Enter Phone Number</h3>
              <div className="max-w-md">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+256701234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the number you want to pay from
                </p>
              </div>
            </div>
          )}

          {/* Payment Summary and Action */}
          {selectedPlan && selectedPayment && (
            <div className="border-t pt-6">
              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Payment Summary</h4>
                <div className="flex justify-between items-center">
                  <span>{selectedPlan.name} ({selectedPlan.duration})</span>
                  <span className="font-semibold">UGX {selectedPlan.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Payment Method</span>
                  <span>{paymentMethods.find(m => m.id === selectedPayment)?.name}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePayment}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Pay UGX ${selectedPlan.price.toLocaleString()}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}