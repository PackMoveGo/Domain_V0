import React,{useState,useRef,useEffect} from 'react';
import {getGlobal503Status,setGlobal503Status} from '../../services/service.apiSW';
import {apiCache} from '../../util/apiCache';

interface DevToolsLauncherProps{
  isVisible?:boolean;
}

export default function DevToolsLauncher({isVisible=true}:DevToolsLauncherProps){
  const [isOpen,setIsOpen]=useState(false);
  const [is503,setIs503]=useState(getGlobal503Status());
  const [position,setPosition]=useState({x:0,y:0});
  const [isDragging,setIsDragging]=useState(false);
  const [dragOffset,setDragOffset]=useState({x:0,y:0});
  const containerRef=useRef<HTMLDivElement>(null);

  if(!isVisible) return null;

  const handleMouseDown=(e:React.MouseEvent)=>{
    // Don't interfere with button clicks inside the panel, but allow dragging the icon button
    const target = e.target as HTMLElement;
    const isInternalButton = target.closest('.dev-tool-action-button');
    if(isInternalButton) return;
    
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
      if(!isDragging) return;
      
      const newX=e.clientX-dragOffset.x;
      const newY=e.clientY-dragOffset.y;
      
      // Keep within viewport bounds
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

    return ()=>{
      document.removeEventListener('mousemove',handleMouseMove);
      document.removeEventListener('mouseup',handleMouseUp);
    };
  },[isDragging,dragOffset]);

  const toggle503=()=>{
    const newStatus=!is503;
    setGlobal503Status(newStatus);
    setIs503(newStatus);
    console.log(`🔧 [DEV] 503 Status toggled to: ${newStatus}`);
  };

  const clearCache=()=>{
    if(apiCache && typeof apiCache.clear==='function'){
      apiCache.clear();
      console.log('🔧 [DEV] API cache cleared');
    }else{
      console.log('🔧 [DEV] Cache clear not available');
    }
  };

  const reloadPage=()=>{
    window.location.reload();
  };

  return (
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
      {!isOpen ? (
        <button
          onClick={()=>setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all"
          title="Drag to move • Click to open"
          style={{cursor:isDragging?'grabbing':'grab'}}
        >
          🛠️
        </button>
      ):(
        <div 
          className="bg-white rounded-lg shadow-2xl border border-gray-300 p-4 w-80"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg select-none">Dev Tools 🎯</h3>
            <button
              onClick={()=>setIsOpen(false)}
              className="dev-tool-action-button text-gray-500 hover:text-gray-700"
              style={{cursor:'pointer'}}
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">503 Status:</span>
              <button
                onClick={toggle503}
                className={`dev-tool-action-button px-3 py-1 rounded text-sm font-medium ${
                  is503
                    ?'bg-red-500 text-white'
                    :'bg-green-500 text-white'
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

            <div className="pt-3 border-t border-gray-200 text-xs text-gray-600">
              <div>ENV: {process.env.NODE_ENV}</div>
              <div>Port: {window.location.port||'default'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

