import { useState, useEffect} from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoutes({ children }) {
  const [validSession, setValidSession] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("hello");
    
    const checkAuth = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_API_BASE_URL + "/api/auth/auth-test",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setValidSession(true);
          console.log("ok");
          
        } else {
          setValidSession(false);
        }
      } catch (error) {
        setValidSession(false);
      } finally {
        setLoading(false);
      }
    };    
    checkAuth();
  }, []);

  if (loading) return <div>Checking session...</div>;

  return validSession ? <Outlet /> : <Navigate to="/login" replace />;
}
