import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Info } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Ab axiosInstance use ho raha hai (Render pe jayega)
      const res = await axiosInstance.post("/admin/login", { email, password });
      
      if (res.data.admin) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminUser", JSON.stringify(res.data.admin));
        toast.success("Admin login successful!");
        router.push("/admin/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@yourtube.com");
    setPassword("admin123");
    toast.info("Demo credentials filled!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-600 p-3 rounded-full shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Admin Login</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Demo Credentials</p>
            <p className="text-xs text-blue-600 mt-1">Email: admin@yourtube.com</p>
            <p className="text-xs text-blue-600">Password: admin123</p>
            <button onClick={fillDemoCredentials} className="text-xs font-bold text-blue-700 hover:underline mt-2">Click to auto-fill</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@yourtube.com" required className="bg-white border-gray-300 text-gray-900" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="bg-white border-gray-300 text-gray-900" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white h-10">
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
