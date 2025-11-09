#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const killPort = async (port) => {
  try {
    // Find processes using the port
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    const pids = stdout.trim().split('\n').filter(pid => pid);
    
    if (pids.length > 0) {
      console.log(`🔍 Found ${pids.length} process(es) using port ${port}: ${pids.join(', ')}`);
      
      // Kill each process
      for (const pid of pids) {
        try {
          await execAsync(`kill ${pid}`);
          console.log(`✅ Killed process ${pid}`);
        } catch (_error) {
          console.log(`⚠️ Could not kill process ${pid}`);
        }
      }
      
      // Wait a moment for processes to die
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`✅ Port ${port} is free`);
    }
  } catch (_error) {
    // No processes found on the port
    console.log(`✅ Port ${port} is free`);
  }
};

const port = process.argv[2] || 5050;
killPort(port);
