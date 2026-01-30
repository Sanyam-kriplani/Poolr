import Navbar from "@/components/navbar.jsx";
import { UserProvider } from "@/context/userContext.jsx";
import { UserVehicleProvider } from "@/context/userVehicleContext.jsx";
import { Outlet } from "react-router-dom";


export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <UserProvider>
       <UserVehicleProvider>
       <Navbar/>
       <Outlet/>
      </UserVehicleProvider>
      </UserProvider>
    </div>
  );
}