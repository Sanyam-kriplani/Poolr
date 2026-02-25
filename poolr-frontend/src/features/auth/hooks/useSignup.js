import { useState } from "react";
import { signupUser } from "@/api/auth.api";


export function useSignup(){
    const [message, setMessage] = useState('');
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age:18,
        phone_no: "",
        password: "",
      });

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
      const response = await signupUser(formData);

      const result = await response.json();
      setMessage('User successfully added!');
      setOpen(true);
      console.log(result);
    } catch (error) {
      setMessage('Error posting data');
      console.error('Error:', error);
    }
  };


  return {
    message,
    open,
    errors,
    formData,
    handleChange,
    handleSubmit,
    setOpen
  };

}