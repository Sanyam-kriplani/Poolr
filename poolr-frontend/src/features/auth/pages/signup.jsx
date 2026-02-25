import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useSignup } from "@/features/auth/hooks/useSignup";

export default function Signup() { 
  const navigate=useNavigate();
  const {formData,handleChange,handleSubmit,open,setOpen,errors,message}=useSignup();
  if(open){
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Create your account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>


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
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age}</p>
              )}
            </div>


            <div className="space-y-1">
              <Label htmlFor="phone_no">Phone</Label>
              <Input
                id="phone_no"
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone_no}
                onChange={handleChange}
                required
              />
              {errors.phone_no && (
                <p className="text-sm text-destructive">{errors.phone_no}</p>
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
              Sign Up
            </Button>   
          </form>
          <div className="text-center">
                Already have an account? 
                <button type="button" onClick={() => navigate("/login")} className="text-sm text-primary underline hover:opacity-80">
                  Login
                </button>
          </div>  
        </CardContent>
      </Card>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Created 🎉</AlertDialogTitle>
            <AlertDialogDescription>
              Your account has been created successfully. Please login to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => navigate("/login")}
            >
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}