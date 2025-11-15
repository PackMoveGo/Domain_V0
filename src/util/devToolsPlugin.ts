// Dev Tools Plugin System
// Provides extensibility for adding new dev tools features

import React from 'react';
import { ENABLE_DEV_TOOLS } from './env';

// Check if dev tools are enabled
const isDevMode=()=>{
  const env=(import.meta as any).env||{};
  const isDev=env.MODE==='development';
  return isDev&&ENABLE_DEV_TOOLS;
};

// Plugin interface
export interface DevToolsPlugin{
  id:string;
  name:string;
  icon?:string;
  component?:React.ComponentType<any>;
  command?:()=>void|Promise<void>;
  tab?:{
    id:string;
    label:string;
    icon:string;
    render:()=>React.ReactNode;
  };
  config?:Record<string,any>;
}

// Plugin registry
class DevToolsPluginRegistry{
  private static instance:DevToolsPluginRegistry;
  private plugins:Map<string,DevToolsPlugin>=new Map();
  private hooks:Map<string,Array<(...args:any[])=>void>>=new Map();

  static getInstance():DevToolsPluginRegistry{
    if(!DevToolsPluginRegistry.instance){
      DevToolsPluginRegistry.instance=new DevToolsPluginRegistry();
    }
    return DevToolsPluginRegistry.instance;
  }

  // Register a plugin
  register(plugin:DevToolsPlugin):boolean{
    if(!isDevMode()){
      console.warn(`[DevTools] Plugin registration disabled in production: ${plugin.id}`);
      return false;
    }

    if(this.plugins.has(plugin.id)){
      console.warn(`[DevTools] Plugin already registered: ${plugin.id}`);
      return false;
    }

    this.plugins.set(plugin.id,plugin);
    console.log(`[DevTools] Plugin registered: ${plugin.name} (${plugin.id})`);
    return true;
  }

  // Unregister a plugin
  unregister(pluginId:string):boolean{
    if(!this.plugins.has(pluginId)){
      return false;
    }

    this.plugins.delete(pluginId);
    console.log(`[DevTools] Plugin unregistered: ${pluginId}`);
    return true;
  }

  // Get all plugins
  getAllPlugins():DevToolsPlugin[]{
    return Array.from(this.plugins.values());
  }

  // Get plugin by ID
  getPlugin(pluginId:string):DevToolsPlugin|undefined{
    return this.plugins.get(pluginId);
  }

  // Register a hook
  on(event:string,callback:(...args:any[])=>void):()=>void{
    if(!isDevMode())return()=>{};

    if(!this.hooks.has(event)){
      this.hooks.set(event,[]);
    }

    const callbacks=this.hooks.get(event)!;
    callbacks.push(callback);

    // Return unsubscribe function
    return()=>{
      const index=callbacks.indexOf(callback);
      if(index>-1){
        callbacks.splice(index,1);
      }
    };
  }

  // Emit a hook event
  emit(event:string,...args:any[]):void{
    if(!isDevMode())return;

    const callbacks=this.hooks.get(event);
    if(callbacks){
      callbacks.forEach(callback=>{
        try{
          callback(...args);
        }catch(error){
          console.error(`[DevTools] Error in hook ${event}:`,error);
        }
      });
    }
  }

  // Get all tabs from plugins
  getPluginTabs():Array<{id:string,label:string,icon:string,render:()=>React.ReactNode}>{
    return this.getAllPlugins()
      .filter(plugin=>plugin.tab)
      .map(plugin=>plugin.tab!);
  }

  // Execute plugin command
  async executeCommand(pluginId:string):Promise<void>{
    if(!isDevMode())return;

    const plugin=this.getPlugin(pluginId);
    if(!plugin||!plugin.command){
      console.warn(`[DevTools] Plugin ${pluginId} has no command`);
      return;
    }

    try{
      await plugin.command();
      this.emit('command:executed',pluginId);
    }catch(error){
      console.error(`[DevTools] Error executing command for ${pluginId}:`,error);
      this.emit('command:error',pluginId,error);
    }
  }

  // Get plugin configuration
  getConfig(pluginId:string):Record<string,any>|undefined{
    const plugin=this.getPlugin(pluginId);
    return plugin?.config;
  }

  // Update plugin configuration
  updateConfig(pluginId:string,config:Partial<Record<string,any>>):boolean{
    if(!isDevMode())return false;

    const plugin=this.getPlugin(pluginId);
    if(!plugin){
      return false;
    }

    plugin.config={...plugin.config,...config};
    this.emit('config:updated',pluginId,plugin.config);
    return true;
  }

  // Clear all plugins (for testing)
  clear():void{
    this.plugins.clear();
    this.hooks.clear();
  }
}

// Create singleton instance
const pluginRegistry=DevToolsPluginRegistry.getInstance();

// Export functions
export const registerDevToolsPlugin=(plugin:DevToolsPlugin)=>pluginRegistry.register(plugin);
export const unregisterDevToolsPlugin=(pluginId:string)=>pluginRegistry.unregister(pluginId);
export const getDevToolsPlugins=()=>pluginRegistry.getAllPlugins();
export const getDevToolsPlugin=(pluginId:string)=>pluginRegistry.getPlugin(pluginId);
export const onDevToolsEvent=(event:string,callback:(...args:any[])=>void)=>pluginRegistry.on(event,callback);
export const emitDevToolsEvent=(event:string,...args:any[])=>pluginRegistry.emit(event,...args);
export const getDevToolsPluginTabs=()=>pluginRegistry.getPluginTabs();
export const executeDevToolsCommand=(pluginId:string)=>pluginRegistry.executeCommand(pluginId);
export const getDevToolsPluginConfig=(pluginId:string)=>pluginRegistry.getConfig(pluginId);
export const updateDevToolsPluginConfig=(pluginId:string,config:Partial<Record<string,any>>)=>pluginRegistry.updateConfig(pluginId,config);

// Export default instance
export default pluginRegistry;

// Example plugin registration (for documentation)
/*
// Example: Register a custom dev tool plugin
import { registerDevToolsPlugin } from './util/devToolsPlugin';

registerDevToolsPlugin({
  id: 'my-custom-tool',
  name: 'My Custom Tool',
  icon: '🔧',
  tab: {
    id: 'custom',
    label: 'Custom',
    icon: '🔧',
    render: () => (
      <div>
        <h3>Custom Dev Tool</h3>
        <button onClick={() => console.log('Custom action')}>
          Do Something
        </button>
      </div>
    )
  },
  command: async () => {
    console.log('Custom command executed');
  },
  config: {
    enabled: true
  }
});
*/

