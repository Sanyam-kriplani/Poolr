import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Phone,
  Mail,
  Car,
  User,
  Save,
  Camera,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useUser } from "@/context/userContext.jsx";
import { useUserVehicle } from "@/context/userVehicleContext.jsx";

export default function MyProfile() {

    const [Profile, setProfile] = useState(null);
    const [profileMsg, setProfileMsg] = useState("");
    const [accountMsg, setAccountMsg] = useState("");
    const [vehicleMsg, setVehicleMsg] = useState("");
    const [accDetails, setAccDetails] = useState({});
    const [vehicleDetails, setVehicleDetails] = useState({});
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [accountSuccess, setAccountSuccess] = useState(false);
    const [vehicleSuccess, setVehicleSuccess] = useState(false);
    const { user } = useUser();
    const { userVehicle, setUserVehicle } = useUserVehicle();

    const [confirmProfileOpen, setConfirmProfileOpen] = useState(false);
    const [confirmAccountOpen, setConfirmAccountOpen] = useState(false);
    const [confirmVehicleOpen, setConfirmVehicleOpen] = useState(false);

    const  handleChange=(event)=>{
        const profilePhoto=event.target.files[0];
        console.log(profilePhoto);
        setProfile(profilePhoto);
    }

   const handleAccDetailsChange=(event)=>{


   const{id,value}=event.target
    setAccDetails((prev)=>({
        ...prev,
        [id]: value
    }));
   };

   const handleVehicleDetailsChange = (event) => {
     const { id, value } = event.target;
     setVehicleDetails((prev) => ({
       ...prev,
       [id]: value
     }));
   };

   const handleVehicleUpdate = () => {
     console.log(vehicleDetails);

     if (Object.keys(vehicleDetails).length === 0) {
       setVehicleSuccess(false);
       setVehicleMsg("Please enter the required details of your vehicle first");
       return;
     }

     if (!vehicleDetails.model) {
       setVehicleSuccess(false);
       setVehicleMsg("Please enter model name of your vehicle");
       return;
     }

     if (!vehicleDetails.brand) {
       setVehicleSuccess(false);
       setVehicleMsg("Kindly enter the brand name of your vehicle");
       return;
     }

     if (!vehicleDetails.registrationNo) {
       setVehicleSuccess(false);
       setVehicleMsg("Kindly enter the registration number of your vehicle");
       return;
     }
     const vehicleRegex = /^[A-Z]{2}[\s-]?[0-9]{1,2}[\s-]?[A-Z]{1,2}[\s-]?[0-9]{4}$/;

     if (!vehicleRegex.test(vehicleDetails.registrationNo)) {
       setVehicleSuccess(false);
       setVehicleMsg("Kindly enter a valid registeration number of your vehicle");
       return;
     }

     if (!vehicleDetails.color) {
       setVehicleSuccess(false);
       setVehicleMsg("Kindly enter the color of your vehicle");
       return;
     }

     const upload = async () => {
       try {
         const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/vehicles/', {
           method: 'POST',
           credentials: "include",
           headers: {
             "Content-Type": "application/json",
           },
           body: JSON.stringify(vehicleDetails),
         });
         const data = await response.json();

         if (!response.ok) {
           setVehicleSuccess(false);
           setVehicleMsg(data?.message || "Error updating vehicle details");
         } else {
           setVehicleSuccess(true);
           setVehicleMsg(data?.message || "Vehicle details updated successfully");

           // to keep vehicle context in sync
           setUserVehicle((prev) => ({
             ...prev,
             ...vehicleDetails,
           }));
         }
       } catch (error) {
         setVehicleSuccess(false);
         setVehicleMsg("Error updating vehicle details");
       }
     };
     upload();
   };

   const handleAccUpdate = () => {
     console.log(accDetails);

     if (Object.keys(accDetails).length === 0) {
       setAccountSuccess(false);
       setAccountMsg("Please enter the new phone no. or email");
       return;
     }

     if (accDetails.phone_no && !/^[6-9]\d{9}$/.test(accDetails.phone_no)) {
       setAccountSuccess(false);
       setAccountMsg("Please enter a valid 10-Digit phone number");
       return;
     }

     if (accDetails.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(accDetails.email)) {
       setAccountSuccess(false);
       setAccountMsg("Please enter a valid email address");
       return;
     }

     const upload = async () => {
       try {
         const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/users/updateProfile', {
           method: 'PATCH',
           credentials: "include",
           headers: {
             "Content-Type": "application/json",
           },
           body: JSON.stringify(accDetails),
         });
         const data = await response.json();
         if (!response.ok) {
           setAccountSuccess(false);
           setAccountMsg(data?.message || "Error updating account details");
         }else{
           setAccountSuccess(true);
           setAccountMsg(data?.message || "Account details updated successfully");
           console.log(response.error);
         }
       } catch (error) {
         setAccountSuccess(false);
         setAccountMsg("Error updating details");
       }
     };
     upload();
   };

    const handleProfilePhotoUpload = () => {
      if (!Profile) {
        setProfileSuccess(false);
        setProfileMsg("Please select a file first");
        return;
      }
      const formData = new FormData();
      formData.append('profilePhoto', Profile);
      const upload = async () => {
        try {
          const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/users/updateProfilePhoto', {
            method: 'PATCH',
            credentials: "include",
            body: formData
          });
          if (response.ok) {
            setProfileSuccess(true);
            setProfileMsg("Profile picture updated successfully");
          } else if (response.status === 413) {
            setProfileSuccess(false);
            setProfileMsg("File too large. Please upload an image under 2MB.");
          } else {
            await response.text();
            setProfileSuccess(false);
            setProfileMsg("Error uploading profile picture");
          }
        } catch (error) {
          console.log(error);
          setProfileSuccess(false);
          setProfileMsg("Error uploading the profile picture");
        }
      };
      upload();
    };

  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto max-w-5xl px-6 space-y-8">

        {/* HEADER */}
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            {/* Image will come from backend */}
            <AvatarImage src={user?.profile_photo
      ? import.meta.env.VITE_API_BASE_URL + user.profile_photo
      : undefined} alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal and vehicle details
            </p>
          </div>
        </div>

        <Separator />

        {/* PROFILE PICTURE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Profile Picture
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.profile_photo
      ? import.meta.env.VITE_API_BASE_URL + user.profile_photo
      : undefined} alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <Label htmlFor="profilePic">
                Upload a new profile picture
              </Label>
              <Input
                id="profilePic"
                type="file"
                accept="image/*"
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                JPG, PNG. Max size 2MB.
              </p>
            </div>

            <div className="flex w-full flex-col items-end mt-4 sm:mt-6">
              <AlertDialog open={confirmProfileOpen} onOpenChange={setConfirmProfileOpen}>
                <AlertDialogTrigger asChild>
                  <Button className="mt-8">
                    <Save className="mr-2 h-4 w-4" />
                    Update Profile Photo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Update profile picture?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will replace your existing profile picture.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setConfirmProfileOpen(false);
                        handleProfilePhotoUpload();
                      }}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {profileMsg && (
                <div className="mt-3 max-w-xs rounded-md border-l-4 border-destructive/60 bg-destructive/5 px-3 py-2 text-sm text-destructive/90 text-right flex gap-2">
                  {profileSuccess ? (
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
                  )}
                  <span>{profileMsg}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* UPDATE ACCOUNT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Update Account
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={user?.email}
                onChange={handleAccDetailsChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone_no"
                type="tel"
                placeholder={user?.phone_no}
                onChange={handleAccDetailsChange}
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <AlertDialog open={confirmAccountOpen} onOpenChange={setConfirmAccountOpen}>
                <AlertDialogTrigger asChild>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Update Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Update account details?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your email or phone number will be updated.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setConfirmAccountOpen(false);
                        handleAccUpdate();
                      }}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="md:col-span-2 flex justify-end">
              {accountMsg && (
                <div className="mt-2 rounded-md border-l-4 border-destructive/60 bg-destructive/5 px-3 py-2 text-sm text-destructive/90 flex gap-2">
                  {accountSuccess ? (
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
                  )}
                  <span>{accountMsg}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* UPDATE VEHICLE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Add/Update Your Vehicle
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">

            <div className="space-y-2">
              <Label htmlFor="model">Vehicle Model</Label>
              <Input id="model" placeholder={userVehicle?.model} onChange={handleVehicleDetailsChange} />
            </div>

             <div className="space-y-2">
              <Label htmlFor="brand">Vehicle Brand</Label>
              <Input id="brand" placeholder={userVehicle?.brand} onChange={handleVehicleDetailsChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNo">Vehicle Registration Number</Label>
              <Input id="registrationNo" placeholder={userVehicle?.registrationNo} onChange={handleVehicleDetailsChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Vehicle Color</Label>
              <Input id="color" type="text"  placeholder={userVehicle?.color} onChange={handleVehicleDetailsChange} />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <AlertDialog open={confirmVehicleOpen} onOpenChange={setConfirmVehicleOpen}>
                <AlertDialogTrigger asChild>
                  <Button>
                    <Car className="mr-2 h-4 w-4" />
                    Register Vehicle
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Register or update vehicle?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will save your vehicle details for future rides.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setConfirmVehicleOpen(false);
                        handleVehicleUpdate();
                      }}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="md:col-span-2 flex justify-end">
              {vehicleMsg && (
                <div className="mt-2 rounded-md border-l-4 border-destructive/60 bg-destructive/5 px-3 py-2 text-sm text-destructive/90 flex gap-2">
                  {vehicleSuccess ? (
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
                  )}
                  <span>{vehicleMsg}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}