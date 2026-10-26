import { useState } from "react";
import axios from "axios";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Youtube, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-red-600 to-red-800 p-12 flex-col justify-center items-center text-white">
          <div className="bg-white/20 p-4 rounded-full mb-6"><Youtube className="w-16 h-16" /></div>
          <h2 className="text-3xl font-bold mb-4">YourTube</h2>
          <p className="text-center text-white/80 mb-6">India's most loved video platform. Watch, create, and share your videos with the world.</p>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-2">{isRegister ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-gray-600 mb-6">{isRegister ? "Sign up to start watching" : "Sign in to continue to YourTube"}</p>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required /></div>
            )}
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></div>
            <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3">{loading ? "Loading..." : isRegister ? "Create Account" : "Login"}</Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsRegister(!isRegister); setErrorMsg(""); }} className="text-sm text-red-600 hover:underline">
              {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
