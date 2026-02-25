
export async function signupUser(formData){
    const response = await fetch(import.meta.env.VITE_API_BASE_URL+'/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }
      else{
        return response;
    }
      }


export async function loginUser(formData, setAuthError){
  const response = await fetch(import.meta.env.VITE_API_BASE_URL+'/api/auth/login', {
          method: 'POST',
          credentials:"include",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
  
        if (response.status === 401) {
          setAuthError("Invalid email or password");
          return;
        }
  
        if (!response.ok) {
          throw new Error('Something went wrong');
        }
        else{
          return response;
        }
}

export async function forgotPassword(email){
  const response = await fetch(import.meta.env.VITE_API_BASE_URL+'/api/auth/forgotpass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      return response;
}

export async function resetPass(newPass){
        const response = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/auth/resetPass",
        {
          method: "PATCH",
          credentials:"include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPass }),
        }
      );

      return response;

}

export async function verifyOtp(email, otp){
  const response =  await  fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/auth/verifyOtp",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      return response;
}

export async function logoutUser(){
  const response=await fetch(import.meta.env.VITE_API_BASE_URL + "/api/auth/",{
            method:"DELETE",
            credentials:"include"
          });

  return response;
}