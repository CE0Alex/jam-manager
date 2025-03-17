import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Main build function
async function build() {
  console.log('Starting custom build process...');
  
  try {
    // Create a temporary Vite config that excludes the problematic files
    console.log('Creating temporary build configuration...');
    
    // First, read the original vite.config.ts
    const viteConfigPath = 'vite.config.ts';
    const tempConfigPath = 'vite.config.build.ts';
    
    try {
      // Create a modified config that excludes the problematic file
      const tempConfigContent = `
// Temporary build configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  optimizeDeps: {
    exclude: ['src/components/schedule/ProductionCalendar.fixed'],
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'tempo-routes': path.resolve(__dirname, './src/tempo-routes-mock.js')
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Exclude the problematic file from the build
    rollupOptions: {
      external: [
        './src/components/schedule/ProductionCalendar.fixed',
        './src/components/schedule/ProductionCalendar.fixed.tsx',
      ],
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'date-fns',
            'recharts',
          ],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
        },
      },
    },
  },
});
`;
      
      // Write the temporary config
      await fs.writeFile(tempConfigPath, tempConfigContent, 'utf8');
      console.log(`Created temporary build config at ${tempConfigPath}`);
      
      // Fix the ScheduleView.js file - most important change
      const scheduleViewPath = 'src/components/schedule/ScheduleView.js';
      const scheduleViewBackupPath = 'src/components/schedule/ScheduleView.js.bak';
      
      try {
        // Backup the original ScheduleView file
        const scheduleViewContent = await fs.readFile(scheduleViewPath, 'utf8');
        await fs.writeFile(scheduleViewBackupPath, scheduleViewContent, 'utf8');
        console.log(`Backed up ${scheduleViewPath} to ${scheduleViewBackupPath}`);
        
        // Modify the file to use SimpleProductionCalendar directly
        let modifiedContent = scheduleViewContent.replace(
          `import ProductionCalendar from "./ProductionCalendar.fixed";`,
          `import ProductionCalendar from "./SimpleProductionCalendar";`
        );
        
        await fs.writeFile(scheduleViewPath, modifiedContent, 'utf8');
        console.log(`Modified ${scheduleViewPath} to use SimpleProductionCalendar directly`);
      } catch (err) {
        console.error(`Error modifying ScheduleView: ${err.message}`);
      }
      
      // Create a temporary index file for schedule components
      const scheduleIndexPath = 'src/components/schedule/index.tsx';
      const scheduleIndexBackupPath = 'src/components/schedule/index.tsx.bak';
      
      // Check if the schedule index file exists
      try {
        const scheduleIndexStats = await fs.stat(scheduleIndexPath);
        if (scheduleIndexStats.isFile()) {
          // Backup the original file
          await fs.copyFile(scheduleIndexPath, scheduleIndexBackupPath);
          console.log(`Backed up ${scheduleIndexPath} to ${scheduleIndexBackupPath}`);
          
          // Create a temporary index file that uses SimpleProductionCalendar
          const tempIndexContent = `
import SimpleProductionCalendar from './SimpleProductionCalendar';

// Export SimpleProductionCalendar as ProductionCalendar
export { SimpleProductionCalendar as ProductionCalendar };
export default SimpleProductionCalendar;
`;
          
          // Write the temporary index file
          await fs.writeFile(scheduleIndexPath, tempIndexContent, 'utf8');
          console.log(`Created temporary index file at ${scheduleIndexPath}`);
        }
      } catch (err) {
        console.log(`Could not modify schedule index file: ${err.message}`);
      }
    } catch (err) {
      console.error(`Error creating temporary config: ${err.message}`);
    }
    
    // Run the build command with the temporary config
    console.log('Running Vite build with custom config...');
    await runCommand('npx vite build --config vite.config.build.ts');
    
    // Clean up the temporary files
    console.log('Cleaning up temporary files...');
    try {
      await fs.unlink(tempConfigPath);
      console.log(`Removed temporary config ${tempConfigPath}`);
      
      // Restore the ScheduleView file if it was backed up
      const scheduleViewBackupPath = 'src/components/schedule/ScheduleView.js.bak';
      const scheduleViewPath = 'src/components/schedule/ScheduleView.js';
      
      try {
        const backupStats = await fs.stat(scheduleViewBackupPath);
        if (backupStats.isFile()) {
          await fs.copyFile(scheduleViewBackupPath, scheduleViewPath);
          await fs.unlink(scheduleViewBackupPath);
          console.log(`Restored ${scheduleViewPath} from backup`);
        }
      } catch (err) {
        console.log(`No backup file to restore for ${scheduleViewPath}`);
      }
      
      // Restore the schedule index file if it was backed up
      const scheduleIndexBackupPath = 'src/components/schedule/index.tsx.bak';
      const scheduleIndexPath = 'src/components/schedule/index.tsx';
      
      try {
        const backupStats = await fs.stat(scheduleIndexBackupPath);
        if (backupStats.isFile()) {
          await fs.copyFile(scheduleIndexBackupPath, scheduleIndexPath);
          await fs.unlink(scheduleIndexBackupPath);
          console.log(`Restored ${scheduleIndexPath} from backup`);
        }
      } catch (err) {
        console.log(`No backup file to restore for ${scheduleIndexPath}`);
      }
    } catch (err) {
      console.error(`Error cleaning up: ${err.message}`);
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