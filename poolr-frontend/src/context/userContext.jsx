import { createContext,useContext,useState,useEffect } from "react";

const UserContext= createContext(null);


export const  UserProvider=({children})=>{
  const [user, setUser]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const fetchUser=async()=>{
    try {
        const res=await fetch(import.meta.env.VITE_API_BASE_URL+'/api/users/',{
            method:'GET',
            credentials:'include',
            headers: {
                "Content-Type": "application/json",
            },
            body:null,
        })
        const data = await res.json();
        setUser(data);
        console.log(data);
    } catch (error) {
        setUser(null);
    }finally{
        setLoading(false);
    }
  };
  fetchUser();
  },[])

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext);
