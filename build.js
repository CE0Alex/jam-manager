import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Main build function
async function build() {
  console.log('Starting custom build process...');
  
  try {
    // Temporarily rename problematic files
    console.log('Temporarily disabling problematic files...');
    
    // Check if the files exist first
    const fixedFile = 'src/components/schedule/ProductionCalendar.fixed.tsx';
    const backupFile = 'src/components/schedule/ProductionCalendar.fixed.tsx.bak';
    
    try {
      const fixedFileStats = await fs.stat(fixedFile);
      if (fixedFileStats.isFile()) {
        await fs.rename(fixedFile, backupFile);
        console.log(`Renamed ${fixedFile} to ${backupFile}`);
      }
    } catch (err) {
      console.log(`File ${fixedFile} does not exist or couldn't be renamed, continuing.`);
    }
    
    // Run the build command
    console.log('Running Vite build...');
    await runCommand('npx vite build');
    
    // Restore the files
    console.log('Restoring files...');
    try {
      const backupFileStats = await fs.stat(backupFile);
      if (backupFileStats.isFile()) {
        await fs.rename(backupFile, fixedFile);
        console.log(`Restored ${backupFile} to ${fixedFile}`);
      }
    } catch (err) {
      console.log(`File ${backupFile} does not exist or couldn't be restored.`);
    }
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Helper function to run shell commands
function runCommand(command) {
  return new Promise((resolve, reject) => {
    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command execution error: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
      }
      
      console.log(stdout);
      resolve();
    });
    
    // Forward the output to the console in real-time
    process.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}

// Run the build
build(); 