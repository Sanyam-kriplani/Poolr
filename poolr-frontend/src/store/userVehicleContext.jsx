import { createContext,useContext,useState,useEffect } from "react";

const UserVehicleContext= createContext(null);


export const  UserVehicleProvider=({children})=>{
  const [userVehicle, setUserVehicle]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const fetchUserVehicle=async()=>{
    try {
        const res=await fetch(import.meta.env.VITE_API_BASE_URL+'/api/vehicles/',{
            method:'GET',
            credentials:'include',
            headers: {
                "Content-Type": "application/json",
            },
            body:null,
        })
        const data = await res.json();
        setUserVehicle(data);
        console.log(data);
    } catch (error) {
        setUserVehicle(null);
    }finally{
        setLoading(false);
    }
  };
  fetchUserVehicle();
  },[])

  return (
    <UserVehicleContext.Provider value={{ userVehicle, setUserVehicle, loading }}>
      {children}
    </UserVehicleContext.Provider>
  )
}

export const useUserVehicle = () => useContext(UserVehicleContext);
