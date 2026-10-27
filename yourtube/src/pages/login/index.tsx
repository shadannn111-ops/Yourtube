import { useState } from "react";
import axios from "axios";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Youtube, AlertCircle } from "lucide-react";

const API_URL = "https://yourtube-backend-4g40.onrender.com";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isRegister) {
        const res = await axios.post(`${API_URL}/user/register`, { email, password, name });
        toast.success(res.data.message || "Account created! Please login.");
        setIsRegister(false);
        setPassword("");
      } else {
        const res = await axios.post(`${API_URL}/user/login`, { email, password });
        if (res.data.result) {
          login(res.data.result);
          toast.success("Login successful!");
          router.push("/");
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Something went wrong";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gray-100">
      {/* ✅ Background Animated Gradient Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* ✅ Floating Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row m-4">
        
        {/* Left Branding Side */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-12 bg-gradient-to-br from-red-600 to-red-800 text-white relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 p-5 rounded-3xl mb-6 shadow-inner backdrop-blur-sm transform hover:scale-110 transition-transform duration-500 cursor-pointer">
              <Youtube className="w-20 h-20 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">YourTube</h2>
            <p className="text-center text-red-100 max-w-sm text-lg font-light leading-relaxed">
              India's most loved video platform. Watch, create, and share your videos with the world.
            </p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 relative">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              {isRegister ? "Sign up to start watching" : "Sign in to continue to YourTube"}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 flex items-center gap-3 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-2 group">
                <Label htmlFor="name" className="text-gray-700 font-medium">Name</Label>
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required className="h-12 bg-gray-50 border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all" />
              </div>
            )}
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-12 bg-gray-50 border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all" />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="h-12 bg-gray-50 border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all" />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-[0_8px_20px_rgba(220,38,38,0.3)] hover:shadow-[0_10px_25px_rgba(220,38,38,0.5)] transition-all transform hover:-translate-y-1">
              {loading ? <span className="animate-pulse">Please wait...</span> : isRegister ? "Create Account" : "Login"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => { setIsRegister(!isRegister); setErrorMsg(""); }} className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors">
              {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
