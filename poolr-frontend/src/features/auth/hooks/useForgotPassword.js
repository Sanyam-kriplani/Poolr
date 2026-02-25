import { forgotPassword, verifyOtp, resetPass } from "@/api/auth.api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


  export function useForgotPassword(){
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState("email"); 
    const [message, setMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass,setConfirmPass] = useState("");
    

    const navigate = useNavigate();

    const handleChange = (e) => {
    setMessage("");
    setSuccessMessage("");
    setEmail(e.target.value);
    };

    const validate = () => {
    if (!email.trim()) {
      setMessage("Email is required");
      return false;
    }
    return true;
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
      const response = await resetPass(newPass);

      if (!response.ok) {
        throw new Error("Invalid input");
      }

      const result = await response.json();

      setMessage("Password reset successfully");
      navigate("/login");
      console.log(result);
     } catch (error) {
      setMessage("Password reset failed");
      console.log(error);
     }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("Email: ", email);

    try {
      const response = await forgotPassword(email);

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      const result = await response.json();

      setSuccessMessage("OTP has been sent to your email");
      setMessage("");
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
      const response = await verifyOtp(email, otp);
      if (!response.ok) {
        throw new Error("Invalid OTP");
      }
      const result = await response.json();
      setMessage("OTP verified successfully");
      setSuccessMessage("");
      setStep("resetpass");
      console.log(result.cookie);
    } catch (error) {
      setMessage("OTP verification failed");
      console.error(error);
    }
   };

    return {email, otp, step, message, successMessage, newPass, confirmPass, handleResetPass, handleChange, setOtp, setNewPass, setStep, handleSubmit, handleVerifyOtp, setConfirmPass };

  }