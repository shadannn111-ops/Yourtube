import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Copy, Smartphone, CreditCard, X, ShieldAlert, Loader2, CheckCircle2, Building2 } from "lucide-react";
import { toast } from "sonner";

const INDIAN_BANKS = [
  { id: "sbi", name: "State Bank of India", color: "#2d5fa5" },
  { id: "hdfc", name: "HDFC Bank", color: "#004c8f" },
  { id: "icici", name: "ICICI Bank", color: "#f58220" },
  { id: "axis", name: "Axis Bank", color: "#97144d" },
  { id: "kotak", name: "Kotak Mahindra Bank", color: "#ed1c24" },
  { id: "pnb", name: "Punjab National Bank", color: "#a41e22" },
  { id: "bob", name: "Bank of Baroda", color: "#f15a29" },
  { id: "canara", name: "Canara Bank", color: "#003f87" },
  { id: "union", name: "Union Bank of India", color: "#ed1c24" },
  { id: "idfc", name: "IDFC First Bank", color: "#9c1c2d" },
  { id: "yes", name: "Yes Bank", color: "#00518f" },
  { id: "indusind", name: "IndusInd Bank", color: "#98002e" },
];

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", color: "#4285f4" },
  { id: "phonepe", name: "PhonePe", color: "#5f259f" },
  { id: "paytm", name: "Paytm", color: "#002970" },
  { id: "bhim", name: "BHIM UPI", color: "#00897b" },
  { id: "amazonpay", name: "Amazon Pay", color: "#ff9900" },
  { id: "whatsapp", name: "WhatsApp Pay", color: "#25d366" },
];

const SubscriptionPage = () => {
  const { user, login, updateUserPlan } = useUser(); // ✅ updateUserPlan import kiya
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [methodType, setMethodType] = useState<"upi" | "bank" | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const [showProcessing, setShowProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const getUserId = () => user?._id || user?.id || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansRes = await axios.get("https://yourtube-backend-4g40.onrender.com/subscription/plans");
        setPlans(plansRes.data);

        const settingsRes = await axios.get("https://yourtube-backend-4g40.onrender.com/admin/payment-settings");
        setPaymentSettings(settingsRes.data);

        const userId = getUserId();
        if (userId) {
          const subRes = await axios.get("https://yourtube-backend-4g40.onrender.com/subscription/" + userId);
          setCurrentSubscription(subRes.data);
        }
      } catch (error) { console.log(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const handleSubscribeClick = (plan: any) => {
    if (!getUserId()) { toast.error("Please login first"); return; }
    if (plan.name.toLowerCase() === "free") { toast.info("Free plan is default. No payment needed."); return; }
    setSelectedPlan(plan);
    setShowUpiModal(true);
  };

  const copyToClipboard = (text: string, label: string) => { navigator.clipboard.writeText(text); toast.success(`${label} copied!`); };
  const handleUpiAppClick = () => { setMethodType("upi"); setShowMethodModal(true); };
  const handleBankClick = () => { setMethodType("bank"); setShowMethodModal(true); };

  const handleProviderSelect = async (provider: any) => {
    setSelectedProvider(provider);
    setShowMethodModal(false);
    setShowUpiModal(false);
    setShowProcessing(true);
    setProcessingStep(0);

    const steps = ["Connecting to " + provider.name + "...", "Verifying details...", "Processing ₹" + selectedPlan?.price + "...", "Confirming transaction...", "Activating subscription..."];
    for (let i = 0; i < steps.length; i++) { setProcessingStep(i); await new Promise((r) => setTimeout(r, 800)); }

    try {
      const res = await axios.post("https://yourtube-backend-4g40.onrender.com/subscription/fake-upi-payment", {
        userId: getUserId(), plan: selectedPlan.name.toLowerCase(), transactionId: `TXN${Date.now()}`, upiId: provider.name,
      });

      if (res.data.success) {
        setCurrentSubscription(res.data.subscription);
        setPaymentSuccess(true);
        
        // ✅ SABSE ZAROORI: User plan instant update karo
        if (user && login) {
          const newPlan = selectedPlan.name.toLowerCase();
          login({ ...user, subscriptionPlan: newPlan });
          if (updateUserPlan) updateUserPlan(newPlan);
        }
        
        setTimeout(() => { setShowProcessing(false); setPaymentSuccess(false); setSelectedPlan(null); setSelectedProvider(null); }, 2000);
      }
    } catch (error) { toast.error("Payment failed. Please try again."); setShowProcessing(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">Subscription Plans</h1>
        <p className="text-gray-500 mb-8 text-lg">Choose the plan that fits you best</p>

        {currentSubscription && currentSubscription.plan && currentSubscription.plan !== "free" && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-xl text-green-800">Current Plan: {currentSubscription.plan.toUpperCase()}</p>
              {currentSubscription.expiryDate && <p className="text-sm text-green-600 font-medium mt-1">Expires: {new Date(currentSubscription.expiryDate).toLocaleDateString()}</p>}
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        )}

        {paymentSettings?.isFakePayment && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-800 text-lg">Demo Mode Active</p>
              <p className="text-sm text-yellow-700 mt-1">{paymentSettings.warningMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan: any) => {
            const isCurrent = currentSubscription && currentSubscription.plan === plan.name.toLowerCase();
            return (
              <div key={plan.name} className={`bg-white border rounded-3xl p-6 flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isCurrent ? "border-green-500 ring-4 ring-green-500/10" : "border-gray-200"}`}>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h2>
                <p className="text-4xl font-extrabold mb-6 text-gray-900">₹{plan.price}<span className="text-sm font-medium text-gray-500">/{plan.duration}</span></p>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-gray-600 font-medium"><Check className="w-5 h-5 text-green-500 flex-shrink-0" /><span>{feature}</span></li>
                  ))}
                </ul>
                <Button onClick={() => handleSubscribeClick(plan)} disabled={isCurrent} className={`mt-auto w-full h-12 rounded-xl font-bold text-base shadow-md transition-all ${isCurrent ? "bg-green-100 hover:bg-green-100 text-green-700" : "bg-red-600 hover:bg-red-700 text-white"}`}>
                  {isCurrent ? "✓ Current Plan" : plan.price === 0 ? "Get Started" : `Subscribe ₹${plan.price}`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Premium Payment Modal */}
      {showUpiModal && selectedPlan && paymentSettings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2.5 rounded-xl"><Smartphone className="w-6 h-6 text-red-600" /></div>
                <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
              </div>
              <button onClick={() => { setShowUpiModal(false); setSelectedPlan(null); }} className="hover:bg-gray-100 rounded-full p-2 transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
            </div>
            
            {paymentSettings.isFakePayment && (
              <div className="bg-red-50 border-b border-red-100 p-5 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div><p className="font-bold text-red-700">⚠️ FAKE PAYMENT DEMO</p><p className="text-sm text-red-600 mt-1">No actual money will be transferred. Subscription will activate for demo.</p></div>
              </div>
            )}

            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div><p className="text-sm font-medium text-gray-500 mb-1">Plan</p><p className="text-xl font-bold text-gray-900">{selectedPlan.name}</p></div>
                <div className="text-right"><p className="text-sm font-medium text-gray-500 mb-1">Amount</p><p className="text-3xl font-extrabold text-red-600">₹{selectedPlan.price}</p></div>
              </div>
              
              <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div><p className="text-xs font-medium text-gray-500 mb-1">UPI ID</p><p className="font-mono text-base font-semibold text-gray-900">{paymentSettings.upiId}</p></div>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(paymentSettings.upiId, "UPI ID")} className="hover:bg-gray-200 rounded-lg"><Copy className="w-5 h-5 text-gray-600" /></Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button onClick={handleUpiAppClick} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-600/20 transition-all transform hover:-translate-y-1"><Smartphone className="w-5 h-5" />Pay via UPI</button>
                <button onClick={handleBankClick} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-1"><CreditCard className="w-5 h-5" />Pay via Bank</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Provider Selection Modal */}
      {showMethodModal && methodType && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{methodType === "upi" ? "Select UPI App" : "Select Bank"}</h2>
              <button onClick={() => { setShowMethodModal(false); setMethodType(null); }} className="hover:bg-gray-100 rounded-full p-2"><X className="w-6 h-6 text-gray-500" /></button>
            </div>
            <div className="p-4 space-y-2">
              {methodType === "upi" ? UPI_APPS.map((app) => (
                <button key={app.id} onClick={() => handleProviderSelect(app)} className="w-full flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all text-left group">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform" style={{ backgroundColor: app.color }}>{app.name[0]}</div>
                  <span className="font-semibold text-lg text-gray-800">{app.name}</span>
                </button>
              )) : INDIAN_BANKS.map((bank) => (
                <button key={bank.id} onClick={() => handleProviderSelect(bank)} className="w-full flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all text-left group">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform" style={{ backgroundColor: bank.color }}><Building2 className="w-6 h-6" /></div>
                  <span className="font-semibold text-lg text-gray-800">{bank.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Processing/Success Modal */}
      {showProcessing && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center transform animate-in zoom-in-95 duration-300">
            {!paymentSuccess ? (
              <>
                <Loader2 className="w-20 h-20 text-red-600 mx-auto animate-spin mb-6" />
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Processing Payment</h2>
                <p className="text-gray-500 font-medium mb-8">{selectedProvider?.name || "Processing..."}</p>
                <div className="space-y-4 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  {["Connecting to provider", "Verifying payment details", `Processing ₹${selectedPlan?.price}`, "Confirming transaction", "Activating subscription"].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {processingStep > idx ? <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" /> : processingStep === idx ? <Loader2 className="w-6 h-6 text-blue-500 animate-spin flex-shrink-0" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />}
                      <span className={processingStep >= idx ? "text-base font-semibold text-gray-900" : "text-base font-medium text-gray-400"}>{step}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-14 h-14 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-green-600 mb-2">Payment Successful!</h2>
                <p className="text-lg text-gray-700 font-medium mb-4">Your {selectedPlan?.name} plan is now active</p>
                {currentSubscription?.expiryDate && <p className="text-sm text-gray-500 bg-gray-100 inline-block px-4 py-2 rounded-lg">Expires: {new Date(currentSubscription.expiryDate).toLocaleDateString()}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
