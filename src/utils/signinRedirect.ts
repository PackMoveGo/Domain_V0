// Helper function for handling signin redirects based on user role
// This should be called after successful signin in your signin component
// No unnecessary spaces around operators per user preference

import {setToken, setUserData, getRedirectUrlByRole} from './auth';

export interface SigninResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      _id: string;
      email: string;
      role: 'customer' | 'mover' | 'admin' | 'manager';
      firstName?: string;
      lastName?: string;
      phone?: string;
    };
    redirectUrl: string;
  };
}

// Handle successful signin and redirect to appropriate dashboard
export const handleSigninSuccess=(response:SigninResponse):void=>{
  try{
    const {token, user, redirectUrl}=response.data;

    // Store token and user data
    setToken(token);
    setUserData(user);

    console.log('Signin successful, redirecting to:', redirectUrl);
    console.log('User role:', user.role);

    // Redirect to the appropriate dashboard
    // Using window.location.href for full page reload to ensure proper app initialization
    window.location.href=redirectUrl;
  }catch(error){
    console.error('Error handling signin success:', error);
    // Fallback to home page if redirect fails
    window.location.href='https://localhost:5001';
  }
};

// Example integration in signin component:
/*
const handleSubmit=async (e:React.FormEvent)=>{
  e.preventDefault();
  try{
    const response=await axios.post(`${API_URL}/v0/auth/signin`, {
      email,
      password,
      location // optional: user location data
    }, {
      headers:{
        'Content-Type':'application/json',
        'x-api-key':getApiKey()
      }
    });

    if(response.data.success){
      handleSigninSuccess(response.data);
    }
  }catch(error){
    console.error('Signin error:', error);
    setError('Invalid email or password');
  }
};
*/

