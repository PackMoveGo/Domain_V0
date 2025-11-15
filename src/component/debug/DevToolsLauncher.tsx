import React,{useState,useRef,useEffect} from 'react';
import {getGlobal503Status,setGlobal503Status} from '../../services/service.apiSW';
import {apiCache} from '../../util/apiCache';
import {ENABLE_DEV_TOOLS} from '../../util/env';

interface DevToolsLauncherProps{
  isVisible?:boolean;
}

// Safety check: Only allow dev tools in development mode
const isDevMode=()=>{
  const env=(import.meta as any).env||{};
  const isDev=env.MODE==='development';
  return isDev&&ENABLE_DEV_TOOLS;
};

type TabType='quick'|'api'|'cache'|'performance'|'storage'|'network'|'env';

export default function DevToolsLauncher({isVisible=true}:DevToolsLauncherProps){
  const [isOpen,setIsOpen]=useState(false);
  const [activeTab,setActiveTab]=useState<TabType>('quick');
  const [is503,setIs503]=useState(getGlobal503Status());
  const [position,setPosition]=useState({x:0,y:0});
  const [isDragging,setIsDragging]=useState(false);
  const [dragOffset,setDragOffset]=useState({x:0,y:0});
  const [apiStatus,setApiStatus]=useState<{status:'checking'|'online'|'offline',lastCheck?:number}>({status:'checking'});
  const [cacheStats,setCacheStats]=useState<any>(null);
  const [networkStatus,setNetworkStatus]=useState<any>(null);
  const [performanceMetrics,setPerformanceMetrics]=useState<any>(null);
  const containerRef=useRef<HTMLDivElement>(null);

  // Check API status
  const checkApiStatus=async()=>{
    setApiStatus({status:'checking'});
    try{
      const env=(import.meta as any).env||{};
      const apiUrl=env.API_URL||'http://localhost:3000';
      const response=await fetch(`${apiUrl}/health`,{
        method:'GET',
        headers:{'Content-Type':'application/json'}
      });
      setApiStatus({
        status:response.ok?'online':'offline',
        lastCheck:Date.now()
      });
    }catch{
      setApiStatus({status:'offline',lastCheck:Date.now()});
    }
  };

  // Get cache statistics
  const updateCacheStats=()=>{
    if(apiCache&&typeof apiCache.getStats==='function'){
      setCacheStats(apiCache.getStats());
    }
  };

  // Get network status
  const updateNetworkStatus=()=>{
    const connection=(navigator as any).connection;
    setNetworkStatus({
      online:navigator.onLine,
      effectiveType:connection?.effectiveType||'unknown',
      downlink:connection?.downlink||'unknown',
      rtt:connection?.rtt||'unknown',
      saveData:connection?.saveData||false
    });
  };

  // Get performance metrics
  const updatePerformanceMetrics=()=>{
    const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint=performance.getEntriesByType('paint');
    const memory=(performance as any).memory;
    
    setPerformanceMetrics({
      loadTime:Math.round(navigation.loadEventEnd-navigation.loadEventStart),
      domContentLoaded:Math.round(navigation.domContentLoadedEventEnd-navigation.domContentLoadedEventStart),
      firstPaint:Math.round(paint.find((p:any)=>p.name==='first-paint')?.startTime||0),
      firstContentfulPaint:Math.round(paint.find((p:any)=>p.name==='first-contentful-paint')?.startTime||0),
      memory:memory?{
        used:`${(memory.usedJSHeapSize/1024/1024).toFixed(1)}MB`,
        total:`${(memory.totalJSHeapSize/1024/1024).toFixed(1)}MB`,
        limit:`${(memory.jsHeapSizeLimit/1024/1024).toFixed(1)}MB`
      }:null
    });
  };

  // Update stats when tab changes
  useEffect(()=>{
    if(!isOpen)return;
    if(activeTab==='api'){
      checkApiStatus();
    }else if(activeTab==='cache'){
      updateCacheStats();
    }else if(activeTab==='network'){
      updateNetworkStatus();
    }else if(activeTab==='performance'){
      updatePerformanceMetrics();
    }
  },[activeTab,isOpen]);

  // Auto-refresh API status every 10 seconds when on API tab
  useEffect(()=>{
    if(!isOpen||activeTab!=='api')return;
    const interval=setInterval(checkApiStatus,10000);
    return()=>clearInterval(interval);
  },[isOpen,activeTab]);

  const handleMouseDown=(e:React.MouseEvent)=>{
    const target=e.target as HTMLElement;
    const isInternalButton=target.closest('.dev-tool-action-button');
    const isTabButton=target.closest('.dev-tool-tab');
    if(isInternalButton||isTabButton)return;
    
    const rect=containerRef.current?.getBoundingClientRect();
    if(rect){
      setDragOffset({
        x:e.clientX-rect.left,
        y:e.clientY-rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(()=>{
    const handleMouseMove=(e:MouseEvent)=>{
      if(!isDragging)return;
      
      const newX=e.clientX-dragOffset.x;
      const newY=e.clientY-dragOffset.y;
      
      const maxX=window.innerWidth-(containerRef.current?.offsetWidth||0);
      const maxY=window.innerHeight-(containerRef.current?.offsetHeight||0);
      
      setPosition({
        x:Math.max(0,Math.min(newX,maxX)),
        y:Math.max(0,Math.min(newY,maxY))
      });
    };

    const handleMouseUp=()=>{
      setIsDragging(false);
    };

    if(isDragging){
      document.addEventListener('mousemove',handleMouseMove);
      document.addEventListener('mouseup',handleMouseUp);
    }

    return()=>{
      document.removeEventListener('mousemove',handleMouseMove);
      document.removeEventListener('mouseup',handleMouseUp);
    };
  },[isDragging,dragOffset]);

  // Safety check: Never render in production
  if(!isDevMode()||!isVisible)return null;

  const toggle503=()=>{
    const newStatus=!is503;
    setGlobal503Status(newStatus);
    setIs503(newStatus);
    console.log(`🔧 [DEV] 503 Status toggled to: ${newStatus}`);
  };

  const clearCache=()=>{
    if(apiCache&&typeof apiCache.clear==='function'){
      apiCache.clear();
      updateCacheStats();
      console.log('🔧 [DEV] API cache cleared');
    }
  };

  const reloadPage=()=>{
    window.location.reload();
  };

  const dumpStorage=(type:'local'|'session')=>{
    const storage=type==='local'?localStorage:sessionStorage;
    const data:Record<string,any>={};
    for(let i=0;i<storage.length;i++){
      const key=storage.key(i);
      if(key){
        try{
          data[key]=JSON.parse(storage.getItem(key)||'');
        }catch{
          data[key]=storage.getItem(key);
        }
      }
    }
    console.log(`💾 ${type==='local'?'Local':'Session'}Storage:`,data);
  };

  const clearStorage=(type:'local'|'session'|'all')=>{
    if(type==='local'||type==='all')localStorage.clear();
    if(type==='session'||type==='all')sessionStorage.clear();
    console.log(`✅ ${type==='all'?'All':type==='local'?'Local':'Session'} storage cleared`);
  };

  const tabs:Array<{id:TabType,label:string,icon:string}>=[
    {id:'quick',label:'Quick',icon:'⚡'},
    {id:'api',label:'API',icon:'🌐'},
    {id:'cache',label:'Cache',icon:'💾'},
    {id:'performance',label:'Perf',icon:'📊'},
    {id:'storage',label:'Storage',icon:'🗄️'},
    {id:'network',label:'Network',icon:'📡'},
    {id:'env',label:'Env',icon:'🔧'}
  ];

  const renderTabContent=()=>{
    switch(activeTab){
      case 'quick':
        return(
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">503 Status:</span>
              <button
                onClick={toggle503}
                className={`dev-tool-action-button px-3 py-1 rounded text-sm font-medium ${
                  is503?'bg-red-500 text-white':'bg-green-500 text-white'
                }`}
              >
                {is503?'ON':'OFF'}
              </button>
            </div>
            <button
              onClick={clearCache}
              className="dev-tool-action-button w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
            >
              Clear API Cache
            </button>
            <button
              onClick={reloadPage}
              className="dev-tool-action-button w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium"
            >
              Reload Page
            </button>
            <div className="pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1">
              <div>ENV: {process.env.NODE_ENV}</div>
              <div>Port: {window.location.port||'default'}</div>
            </div>
          </div>
        );
      case 'api':
        return(
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">API Status:</span>
              <div className="flex items-center gap-2">
                {apiStatus.status==='checking'&&<span className="text-xs">Checking...</span>}
                {apiStatus.status==='online'&&<span className="text-xs text-green-600">● Online</span>}
                {apiStatus.status==='offline'&&<span className="text-xs text-red-600">● Offline</span>}
                <button
                  onClick={checkApiStatus}
                  className="dev-tool-action-button px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Refresh
                </button>
              </div>
            </div>
            {apiStatus.lastCheck&&(
              <div className="text-xs text-gray-500">
                Last check: {new Date(apiStatus.lastCheck).toLocaleTimeString()}
              </div>
            )}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">503 Status:</span>
              <button
                onClick={toggle503}
                className={`dev-tool-action-button px-3 py-1 rounded text-sm font-medium ${
                  is503?'bg-red-500 text-white':'bg-green-500 text-white'
                }`}
              >
                {is503?'ON':'OFF'}
              </button>
            </div>
            <button
              onClick={()=>{(window as any).testApiConnection?.()}}
              className="dev-tool-action-button w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
            >
              Test API Connection
            </button>
            <button
              onClick={()=>{(window as any).checkApiKey?.()}}
              className="dev-tool-action-button w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
            >
              Check API Key
            </button>
          </div>
        );
      case 'cache':
        return(
          <div className="space-y-3">
            {cacheStats?(
              <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Hit Rate:</span>
                <span className="font-medium">{(cacheStats.hitRate*100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Hits:</span>
                <span>{cacheStats.hits}</span>
              </div>
              <div className="flex justify-between">
                <span>Misses:</span>
                <span>{cacheStats.misses}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Requests:</span>
                <span>{cacheStats.totalRequests}</span>
              </div>
              <div className="flex justify-between">
                <span>Memory Usage:</span>
                <span>{(cacheStats.memoryUsage/1024/1024).toFixed(2)}MB</span>
              </div>
            </div>
            ):(
              <div className="text-sm text-gray-500">No cache stats available</div>
            )}
            <button
              onClick={clearCache}
              className="dev-tool-action-button w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
            >
              Clear Cache
            </button>
            <button
              onClick={()=>{
                updateCacheStats();
                (window as any).showCacheStats?.();
              }}
              className="dev-tool-action-button w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
            >
              Refresh Stats
            </button>
          </div>
        );
      case 'performance':
        return(
          <div className="space-y-3">
            {performanceMetrics?(
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Load Time:</span>
                  <span className="font-medium">{performanceMetrics.loadTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>DOM Ready:</span>
                  <span>{performanceMetrics.domContentLoaded}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>First Paint:</span>
                  <span>{performanceMetrics.firstPaint}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>FCP:</span>
                  <span>{performanceMetrics.firstContentfulPaint}ms</span>
                </div>
                {performanceMetrics.memory&&(
                  <>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span>Memory Used:</span>
                        <span>{performanceMetrics.memory.used}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Total:</span>
                        <span>{performanceMetrics.memory.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Limit:</span>
                        <span>{performanceMetrics.memory.limit}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ):(
              <div className="text-sm text-gray-500">No performance data</div>
            )}
            <button
              onClick={()=>{
                updatePerformanceMetrics();
                (window as any).measurePerformance?.();
              }}
              className="dev-tool-action-button w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
            >
              Refresh Metrics
            </button>
          </div>
        );
      case 'storage':
        return(
          <div className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>LocalStorage:</span>
                <span>{localStorage.length} items</span>
              </div>
              <div className="flex justify-between">
                <span>SessionStorage:</span>
                <span>{sessionStorage.length} items</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={()=>dumpStorage('local')}
                className="dev-tool-action-button px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Dump Local
              </button>
              <button
                onClick={()=>dumpStorage('session')}
                className="dev-tool-action-button px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
              >
                Dump Session
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={()=>clearStorage('local')}
                className="dev-tool-action-button w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium"
              >
                Clear LocalStorage
              </button>
              <button
                onClick={()=>clearStorage('session')}
                className="dev-tool-action-button w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
              >
                Clear SessionStorage
              </button>
              <button
                onClick={()=>clearStorage('all')}
                className="dev-tool-action-button w-full px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded text-sm font-medium"
              >
                Clear All Storage
              </button>
            </div>
          </div>
        );
      case 'network':
        return(
          <div className="space-y-3">
            {networkStatus?(
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={networkStatus.online?'text-green-600':'text-red-600'}>
                    {networkStatus.online?'● Online':'● Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span>{networkStatus.effectiveType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Downlink:</span>
                  <span>{networkStatus.downlink}Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>RTT:</span>
                  <span>{networkStatus.rtt}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Save Data:</span>
                  <span>{networkStatus.saveData?'Yes':'No'}</span>
                </div>
              </div>
            ):(
              <div className="text-sm text-gray-500">No network data</div>
            )}
            <button
              onClick={()=>{
                updateNetworkStatus();
                (window as any).checkConnectivity?.();
              }}
              className="dev-tool-action-button w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
            >
              Refresh Network Info
            </button>
          </div>
        );
      case 'env':
        return(
          <div className="space-y-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>NODE_ENV:</span>
                <span className="font-medium">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between">
                <span>Port:</span>
                <span>{window.location.port||'default'}</span>
              </div>
              <div className="flex justify-between">
                <span>Host:</span>
                <span>{window.location.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span>{window.location.protocol}</span>
              </div>
            </div>
            <button
              onClick={()=>{(window as any).showEnvironmentInfo?.()}}
              className="dev-tool-action-button w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
            >
              Show Full Env Info
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return(
    <div 
      ref={containerRef}
      className="fixed z-[11000]"
      style={{
        left:position.x||'auto',
        top:position.y||'auto',
        right:position.x===0&&position.y===0?'1rem':'auto',
        bottom:position.x===0&&position.y===0?'1rem':'auto',
        cursor:isDragging?'grabbing':'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {!isOpen?(
        <button
          onClick={()=>setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all"
          title="Drag to move • Click to open"
          style={{cursor:isDragging?'grabbing':'grab'}}
        >
          🛠️
        </button>
      ):(
        <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-96 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg select-none">Dev Tools 🎯</h3>
            <button
              onClick={()=>setIsOpen(false)}
              className="dev-tool-action-button text-gray-500 hover:text-gray-700"
              style={{cursor:'pointer'}}
            >
              ✕
            </button>
          </div>
          
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab=>(
              <button
                key={tab.id}
                onClick={()=>setActiveTab(tab.id)}
                className={`dev-tool-tab px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  activeTab===tab.id
                    ?'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                    :'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
}
