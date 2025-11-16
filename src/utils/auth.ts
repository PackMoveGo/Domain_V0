// Authentication utility functions for JWT token management
// No unnecessary spaces around operators per user preference

const TOKEN_KEY='pmg_auth_token';
const USER_KEY='pmg_user_data';

export interface DecodedToken {
  userId: string;
  email: string;
  role: 'customer' | 'mover' | 'admin' | 'manager';
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface UserData {
  _id: string;
  email: string;
  role: 'customer' | 'mover' | 'admin' | 'manager';
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// Get JWT token from localStorage
export const getToken=():string|null=>{
  try{
    return localStorage.getItem(TOKEN_KEY);
  }catch(error){
    console.error('Error retrieving token:',error);
    return null;
  }
};

// Store JWT token in localStorage
export const setToken=(token:string):void=>{
  try{
    localStorage.setItem(TOKEN_KEY,token);
  }catch(error){
    console.error('Error storing token:',error);
  }
};

// Remove JWT token from localStorage
export const removeToken=():void=>{
  try{
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }catch(error){
    console.error('Error removing token:',error);
  }
};

// Store user data in localStorage
export const setUserData=(user:UserData):void=>{
  try{
    localStorage.setItem(USER_KEY,JSON.stringify(user));
  }catch(error){
    console.error('Error storing user data:',error);
  }
};

// Get user data from localStorage
export const getUserData=():UserData|null=>{
  try{
    const userData=localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }catch(error){
    console.error('Error retrieving user data:',error);
    return null;
  }
};

// Decode JWT token (simple base64 decode without validation)
export const decodeToken=(token:string):DecodedToken|null=>{
  try{
    // JWT structure: header.payload.signature
    const parts=token.split('.');
    if(parts.length!==3){
      console.error('Invalid token format');
      return null;
    }
    
    // Decode the payload (second part)
    const payload=parts[1];
    const decoded=atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
    return JSON.parse(decoded) as DecodedToken;
  }catch(error){
    console.error('Error decoding token:',error);
    return null;
  }
};

// Check if token is valid (not expired)
export const isTokenValid=(token:string|null):boolean=>{
  if(!token){
    return false;
  }
  
  try{
    const decoded=decodeToken(token);
    if(!decoded || !decoded.exp){
      return false;
    }
    
    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime=Math.floor(Date.now()/1000);
    return decoded.exp>currentTime;
  }catch(error){
    console.error('Error validating token:',error);
    return false;
  }
};

// Get user role from token
export const getUserRole=():string|null=>{
  const token=getToken();
  if(!token || !isTokenValid(token)){
    return null;
  }
  
  const decoded=decodeToken(token);
  return decoded?.role || null;
};

// Check if user is authenticated
export const isAuthenticated=():boolean=>{
  const token=getToken();
  return token!==null && isTokenValid(token);
};

// Get API key from environment
export const getApiKey=():string=>{
  // Use frontend API key for domain_V0
  return process.env.API_KEY_FRONTEND || '';
};

// Get authorization headers for API requests
export const getAuthHeaders=():{[key:string]:string}=>{
  const headers:{[key:string]:string}={
    'Content-Type':'application/json',
    'x-api-key':getApiKey()
  };
  
  const token=getToken();
  if(token && isTokenValid(token)){
    headers['Authorization']=`Bearer ${token}`;
  }
  
  return headers;
};

// Clear all authentication data
export const clearAuth=():void=>{
  removeToken();
};

// Check if user has specific role
export const hasRole=(allowedRoles:string[]):boolean=>{
  const role=getUserRole();
  return role!==null && allowedRoles.includes(role);
};

// Get redirect URL based on user role
export const getRedirectUrlByRole=(role:string):string=>{
  switch(role){
    case 'customer':
      return 'https://localhost:5002'; // client_V0
    case 'admin':
    case 'manager':
      return 'https://localhost:5003'; // admin_V0
    case 'mover':
      return 'https://localhost:5005'; // mover_V1
    default:
      return 'https://localhost:5001'; // domain_V0
  }
};

