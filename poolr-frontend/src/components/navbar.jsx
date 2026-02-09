import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Plus,
  Search,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { useUser } from "@/context/userContext.jsx";

import { useNavigate } from "react-router-dom";


export default function Navbar() {
    const navigate=useNavigate();
    const {user}=useUser();
    
    const logoutHandler=()=>{
      const logout=async()=>{
        try {
          const response=await fetch(import.meta.env.VITE_API_BASE_URL + "/api/auth/",{
            method:"DELETE",
            credentials:"include"
          });
          navigate('/login');
        } catch (error) {
          console.log("Error logging out",error);
        }
      }
      logout();
    }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* LEFT: LOGO */}
        <div className="flex items-center gap-2">
          {/* Replace src with your asset later */}
          
          <span className="text-xl font-bold tracking-tight cursor-pointer" onClick={()=>{navigate("/")}} >
            Poolr
          </span>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <Button variant="ghost" size="icon" onClick={()=>{navigate("/search-ride")}}>
            <Search className="h-5 w-5" />
          </Button>

          {/* Publish Ride */}
          <Button onClick={()=>{navigate("/publish-ride")}}>
            <Plus className="mr-2 h-4 w-4" />
            Publish Ride
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="h-9 w-9">
                  {/* Profile image will come from server */}
                  <AvatarImage src={user?.profile_photo
      ? import.meta.env.VITE_API_BASE_URL + user.profile_photo
      : undefined} alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 bg-card text-card-foreground shadow-lg border z-50">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={()=>{navigate("/my-profile")}}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

             

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive" onClick={logoutHandler}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}