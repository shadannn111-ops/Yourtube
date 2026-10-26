import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useUser } from "@/lib/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const OTPModal = () => {
  const { otpRequired, verifyOTP, resendOTP, pendingUser } = useUser();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await verifyOTP(otp);
      if (!result.success) {
        setError(result.message || "Invalid OTP");
      }
      setOtp("");
    } catch (err) {
      setError("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const result = await resendOTP();
      if (result.success) {
        setError("");
        alert("OTP sent again!");
      } else {
        setError("Failed to resend OTP");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Dialog open={otpRequired} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify OTP</DialogTitle>
          <DialogDescription>
            We sent a 6-digit OTP to your email {pendingUser?.email}. Please enter it to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </Button>
          <Button onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify & Login"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;
