import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useLogin } from "@/features/auth/hooks/useLogin";


export default function Login() { 
  
  const navigate=useNavigate();
  const {message, errors, authError, handleChange, handleSubmit, formData, setAuthError}=useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Login to account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

           
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
            {authError && (
              <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{authError}</span>
              </div>
            )}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-primary underline hover:opacity-80">
                Forgot password?
              </button>
                <div className="text-center">
                <button type="button" onClick={() => navigate("/signup")} className="text-sm text-primary underline hover:opacity-80">
                Create new account
                </button>
                </div>
            </div>
            
          </form>
        </CardContent>
      </Card>

      {message && <p>{message}</p>}
    </div>
  );
} 