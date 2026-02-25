import { loginUser } from "@/api/auth.api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useLogin(){
  const [message,setMessage]=useState(''); 
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setAuthError("");
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
        const response = await loginUser(formData, setAuthError);
        const result = await response.json();
        setAuthError("");
        setMessage('User successfully logged in!');
        navigate("/")
        console.log(result);
      } catch (error) {
        setMessage('Error posting data');
        console.error('Error:', error);
      }
    };

    return {message, errors, authError, handleChange, handleSubmit, formData, setAuthError }

}