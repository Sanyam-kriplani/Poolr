import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import { useNavigate } from "react-router-dom";


export default function Forgotpass() { 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email"); 
  const [message, setMessage] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass,setConfirmPass] = useState("");
  const navigate=useNavigate();


  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const validate = () => {
    if (!email.trim()) {
      setMessage("Email is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("Email: ", email);

    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL+'/api/users/forgotpass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      const result = await response.json();

      setMessage("OTP sent successfully to your email");
      setStep("otp");
      console.log(result);
    } catch (error) {
      setMessage('Error posting data');
      console.error('Error:', error);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/users/verifyOtp",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid OTP");
      }

      const result = await response.json();
      setMessage("OTP verified successfully");
      setStep("resetpass");
      console.log(result.cookie);
    } catch (error) {
      setMessage("OTP verification failed");
      console.error(error);
    }
  };

  const handleResetPass = async (e) => {
    e.preventDefault();

    if (!newPass || newPass.length < 8) {
      setMessage("Please enter a password of atleast 8 characters");
      return;
    }
    if(newPass!=confirmPass){
      setMessage("The password you entered are not matching");
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/users/resetPass",
        {
          method: "PATCH",
          credentials:"include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPass }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid input");
      }

      const result = await response.json();
      setMessage("Password reset successfully");
      navigate("/login");
      console.log(result);
    } catch (error) {
      setMessage("Password reset failed");
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Forgot Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          {step === "email" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Send OTP
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <Label>Enter OTP</Label>

                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button type="submit" className="w-full">
                Verify OTP
              </Button>
            </form>)}

            {step === "resetpass" && (
            <form onSubmit={handleResetPass} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="newPass">Set New Password</Label>
                <Input
                  id="newPass"
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPass">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Set New Password
              </Button>
            </form>
          )}

          
        </CardContent>
      </Card>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
} 