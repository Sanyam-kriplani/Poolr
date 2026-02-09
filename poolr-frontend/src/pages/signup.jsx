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


export default function Signup() { 
  const [message,setMessage]=useState(''); 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age:18,
    phone_no: "",
    password: "",
  });
  const [open,setOpen]=useState();
  const navigate=useNavigate();

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const value =
    e.target.type === "number"
    ? Number(e.target.value)
    : e.target.value;
     
    setFormData((prev) => ({
      ...prev,
      [e.target.id]:value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.age || Number(formData.age) < 18) {
      newErrors.age = "Age must be 18 or above";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone_no)) {
      newErrors.phone_no = "Enter a valid 10-digit phone number";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("Signup data:", formData);

    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL+'/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      const result = await response.json();
      setMessage('User successfully added!');
      setOpen(true);
      console.log(result);
    } catch (error) {
      setMessage('Error posting data');
      console.error('Error:', error);
    }
  };

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