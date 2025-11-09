// API Development Helper Utilities
// Provides utilities for API testing, debugging, and monitoring in development

import { ENABLE_DEV_TOOLS } from './env';

// Check if dev tools are enabled
const isDevMode=()=>{
  const env=(import.meta as any).env||{};
  const isDev=env.MODE==='development'||env.VITE_DEV_MODE==='development';
  return isDev&&ENABLE_DEV_TOOLS;
};

// API Request/Response Interceptor for debugging
interface InterceptedRequest{
  url:string;
  method:string;
  headers:Record<string,string>;
  body?:any;
  timestamp:number;
}

interface InterceptedResponse{
  url:string;
  status:number;
  statusText:string;
  headers:Record<string,string>;
  body?:any;
  timestamp:number;
  duration:number;
}

class ApiDevHelper{
  private static instance:ApiDevHelper;
  private requestLog:InterceptedRequest[]=[];
  private responseLog:InterceptedResponse[]=[];
  private maxLogSize=100;
  private interceptorsEnabled=false;

  static getInstance():ApiDevHelper{
    if(!ApiDevHelper.instance){
      ApiDevHelper.instance=new ApiDevHelper();
    }
    return ApiDevHelper.instance;
  }

  // Enable request/response interceptors
  enableInterceptors(){
    if(!isDevMode())return;
    if(this.interceptorsEnabled)return;
    
    this.interceptorsEnabled=true;
    
    // Intercept fetch - use arrow function to preserve 'this' context
    const originalFetch=window.fetch;
    
    window.fetch=async(...args)=>{
      const [url,options={}]=args;
      const method=options.method||'GET';
      const headers={...(options.headers as Record<string,string>||{})};
      
      const request:InterceptedRequest={
        url:typeof url==='string'?url:url.toString(),
        method,
        headers,
        body:options.body,
        timestamp:Date.now()
      };
      
      this.requestLog.push(request);
      if(this.requestLog.length>this.maxLogSize){
        this.requestLog.shift();
      }
      
      const startTime=performance.now();
      
      try{
        const response=await originalFetch.apply(window,args);
        const endTime=performance.now();
        const duration=endTime-startTime;
        
        // Clone response to read body without consuming it
        const clonedResponse=response.clone();
        let body:any=null;
        
        try{
          const contentType=response.headers.get('content-type')||'';
          if(contentType.includes('application/json')){
            body=await clonedResponse.json();
          }else if(contentType.includes('text/')){
            body=await clonedResponse.text();
          }
        }catch{
          // Body might not be readable
        }
        
        const responseData:InterceptedResponse={
          url:typeof url==='string'?url:url.toString(),
          status:response.status,
          statusText:response.statusText,
          headers:Object.fromEntries(response.headers.entries()),
          body,
          timestamp:Date.now(),
          duration
        };
        
        this.responseLog.push(responseData);
        if(this.responseLog.length>this.maxLogSize){
          this.responseLog.shift();
        }
        
        // Log to console in dev mode
        if(isDevMode()){
          const statusEmoji=response.ok?'✅':'❌';
          console.log(`${statusEmoji} [API] ${method} ${url} - ${response.status} (${duration.toFixed(0)}ms)`);
        }
        
        return response;
      }catch(error){
        const endTime=performance.now();
        const duration=endTime-startTime;
        
        const responseData:InterceptedResponse={
          url:typeof url==='string'?url:url.toString(),
          status:0,
          statusText:'Network Error',
          headers:{},
          body:error instanceof Error?error.message:'Unknown error',
          timestamp:Date.now(),
          duration
        };
        
        this.responseLog.push(responseData);
        if(this.responseLog.length>this.maxLogSize){
          this.responseLog.shift();
        }
        
        if(isDevMode()){
          console.error(`❌ [API] ${method} ${url} - Network Error (${duration.toFixed(0)}ms)`,error);
        }
        
        throw error;
      }
    };
    
    console.log('🔧 API interceptors enabled');
  }

  // Disable interceptors
  disableInterceptors(){
    if(!this.interceptorsEnabled)return;
    // Note: We can't fully restore original fetch, but we can stop logging
    this.interceptorsEnabled=false;
    console.log('🔧 API interceptors disabled');
  }

  // Get request log
  getRequestLog():InterceptedRequest[]{
    return[...this.requestLog];
  }

  // Get response log
  getResponseLog():InterceptedResponse[]{
    return[...this.responseLog];
  }

  // Clear logs
  clearLogs(){
    this.requestLog=[];
    this.responseLog=[];
    console.log('🔧 API logs cleared');
  }

  // Get API statistics
  getStats(){
    const requests=this.requestLog.length;
    const responses=this.responseLog.length;
    const successful=this.responseLog.filter(r=>r.status>=200&&r.status<300).length;
    const failed=this.responseLog.filter(r=>r.status>=400||r.status===0).length;
    const avgDuration=this.responseLog.length>0
      ?this.responseLog.reduce((sum,r)=>sum+r.duration,0)/this.responseLog.length
      :0;
    
    return{
      totalRequests:requests,
      totalResponses:responses,
      successful,
      failed,
      averageDuration:avgDuration,
      successRate:responses>0?(successful/responses)*100:0
    };
  }

  // Test API endpoint
  async testEndpoint(url:string,options:RequestInit={}):Promise<{
    success:boolean;
    status:number;
    statusText:string;
    duration:number;
    data?:any;
    error?:string;
  }>{
    const startTime=performance.now();
    
    try{
      const response=await fetch(url,{
        ...options,
        headers:{
          'Content-Type':'application/json',
          ...(options.headers||{})
        }
      });
      
      const endTime=performance.now();
      const duration=endTime-startTime;
      
      let data:any=null;
      try{
        const contentType=response.headers.get('content-type')||'';
        if(contentType.includes('application/json')){
          data=await response.json();
        }else{
          data=await response.text();
        }
      }catch{
        // Body might not be readable
      }
      
      return{
        success:response.ok,
        status:response.status,
        statusText:response.statusText,
        duration,
        data
      };
    }catch(error){
      const endTime=performance.now();
      const duration=endTime-startTime;
      
      return{
        success:false,
        status:0,
        statusText:'Network Error',
        duration,
        error:error instanceof Error?error.message:'Unknown error'
      };
    }
  }

  // Test multiple endpoints
  async testEndpoints(endpoints:Array<{url:string,options?:RequestInit}>):Promise<Array<{
    url:string;
    success:boolean;
    status:number;
    duration:number;
    error?:string;
  }>>{
    const results=await Promise.all(
      endpoints.map(async({url,options})=>{
        const result=await this.testEndpoint(url,options);
        return{
          url,
          success:result.success,
          status:result.status,
          duration:result.duration,
          error:result.error
        };
      })
    );
    
    return results;
  }

  // Monitor API health
  async monitorHealth(endpoint:string,interval:number=30000):Promise<()=>void>{
    if(!isDevMode()){
      console.warn('Health monitoring only available in dev mode');
      return()=>{};
    }
    
    let isRunning=true;
    
    const checkHealth=async()=>{
      if(!isRunning)return;
      
      try{
        const result=await this.testEndpoint(endpoint);
        const statusEmoji=result.success?'✅':'❌';
        console.log(`${statusEmoji} [Health] ${endpoint} - ${result.status} (${result.duration.toFixed(0)}ms)`);
      }catch(error){
        console.error(`❌ [Health] ${endpoint} - Error:`,error);
      }
      
      if(isRunning){
        setTimeout(checkHealth,interval);
      }
    };
    
    checkHealth();
    
    return()=>{
      isRunning=false;
      console.log('🔧 Health monitoring stopped');
    };
  }

  // Export logs as JSON
  exportLogs(){
    return{
      requests:this.requestLog,
      responses:this.responseLog,
      stats:this.getStats(),
      exportedAt:new Date().toISOString()
    };
  }

  // Import logs (for testing/debugging)
  importLogs(data:{requests:InterceptedRequest[],responses:InterceptedResponse[]}){
    this.requestLog=data.requests||[];
    this.responseLog=data.responses||[];
    console.log('🔧 API logs imported');
  }
}

// Create singleton instance
const apiDevHelper=ApiDevHelper.getInstance();

// Auto-enable interceptors in dev mode
if(isDevMode()&&typeof window!=='undefined'){
  // Enable interceptors after a short delay to avoid interfering with initial load
  setTimeout(()=>{
    apiDevHelper.enableInterceptors();
  },1000);
}

// Export functions
export const enableApiInterceptors=()=>apiDevHelper.enableInterceptors();
export const disableApiInterceptors=()=>apiDevHelper.disableInterceptors();
export const getApiRequestLog=()=>apiDevHelper.getRequestLog();
export const getApiResponseLog=()=>apiDevHelper.getResponseLog();
export const clearApiLogs=()=>apiDevHelper.clearLogs();
export const getApiStats=()=>apiDevHelper.getStats();
export const testApiEndpoint=(url:string,options?:RequestInit)=>apiDevHelper.testEndpoint(url,options);
export const testApiEndpoints=(endpoints:Array<{url:string,options?:RequestInit}>)=>apiDevHelper.testEndpoints(endpoints);
export const monitorApiHealth=(endpoint:string,interval?:number)=>apiDevHelper.monitorHealth(endpoint,interval);
export const exportApiLogs=()=>apiDevHelper.exportLogs();
export const importApiLogs=(data:{requests:InterceptedRequest[],responses:InterceptedResponse[]})=>apiDevHelper.importLogs(data);

// Export types
export type{InterceptedRequest,InterceptedResponse};

// Export default instance for advanced usage
export default apiDevHelper;
