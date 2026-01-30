import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useNavigate } from "react-router-dom";


export default function Login() { 
  const [message,setMessage]=useState(''); 
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const navigate=useNavigate();

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    
     
    setFormData((prev) => ({
      ...prev,
      [e.target.id]:e.target.value,
    }));
  };

  const validate = () => {
    const newErrors = {};


    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
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

    console.log("Login data:", formData);

    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL+'/api/users/login', {
        method: 'POST',
        credentials:"include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      const result = await response.json();

      setMessage('User successfully logged in!');
      navigate("/dashboard")
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