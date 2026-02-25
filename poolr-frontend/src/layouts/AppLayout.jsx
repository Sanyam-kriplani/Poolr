import Navbar from "@/components/layout/navbar.jsx";
import { UserProvider } from "@/store/userContext.jsx";
import { UserVehicleProvider } from "@/store/userVehicleContext.jsx";
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