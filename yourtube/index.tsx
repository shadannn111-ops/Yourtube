import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const SubscriptionPage = () => {
  const { user } = useUser();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("free");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansRes = await axios.get("http://localhost:5000/subscription/plans");
        setPlans(plansRes.data);
        
        if (user) {
          const subRes = await axios.get(`http://localhost:5000/subscription/${user._id}`);
          setCurrentSubscription(subRes.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      alert("Please login first");
      return;
    }
    
    try {
      // Mock payment - direct subscription activate karo
      const res = await axios.post("http://localhost:5000/subscription/mock-payment", {
        userId: user._id,
        plan,
      });
      
      if (res.data.success) {
        alert("Payment successful! Subscription activated.");
        const subRes = await axios.get(`http://localhost:5000/subscription/${user._id}`);
        setCurrentSubscription(subRes.data);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to activate subscription");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-gray-600 mb-8">Choose the plan that fits you best</p>
        
        {currentSubscription && currentSubscription.plan !== "free" && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
            <p className="font-semibold">Current Plan: {currentSubscription.plan.toUpperCase()}</p>
            <p className="text-sm">Expires: {new Date(currentSubscription.expiryDate).toLocaleDateString()}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan: any) => (
            <div key={plan.name} className="border rounded-lg p-6 flex flex-col">
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold mb-4">₹{plan.price}<span className="text-sm font-normal">/{plan.duration}</span></p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan.name.toLowerCase())}
                disabled={currentSubscription?.plan === plan.name.toLowerCase()}
                className="mt-auto"
              >
                {currentSubscription?.plan === plan.name.toLowerCase() ? "Current Plan" : `Subscribe to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
