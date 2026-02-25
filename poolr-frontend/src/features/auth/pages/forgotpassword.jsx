import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CheckCircle2 } from "lucide-react";

import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";


export default function Forgotpass() { 

  const {email, 
    otp, 
    step, 
    message, 
    successMessage, 
    newPass, 
    confirmPass, 
    handleResetPass, 
    handleChange, 
    setOtp, 
    handleSubmit, 
    handleVerifyOtp,
    setNewPass,
    setConfirmPass,
    
  } = useForgotPassword();



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

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-green-500 bg-green-50 p-3 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
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