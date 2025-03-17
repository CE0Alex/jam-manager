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
    // Handle chunks more efficiently
    rollupOptions: {
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
      
      // Create a mock tempo-routes file if it doesn't exist
      const tempoRoutesPath = 'src/tempo-routes-mock.js';
      if (!(await fileExists(tempoRoutesPath))) {
        const mockContent = `
// Mock implementation of tempo-routes
export const createRoutes = () => ({
  product: {
    list: () => '/products',
    detail: (id) => \`/products/\${id}\`
  },
  job: {
    list: () => '/jobs',
    detail: (id) => \`/jobs/\${id}\`,
    create: () => '/jobs/new'
  },
  schedule: {
    calendar: () => '/schedule'
  },
  customer: {
    list: () => '/customers',
    detail: (id) => \`/customers/\${id}\`,
    create: () => '/customers/new'
  },
  staff: {
    list: () => '/staff',
    detail: (id) => \`/staff/\${id}\`,
    create: () => '/staff/new' 
  },
  dashboard: {
    main: () => '/'
  }
});

export default { createRoutes };
`;
        await fs.writeFile(tempoRoutesPath, mockContent, 'utf8');
        console.log(`Created mock tempo-routes file at ${tempoRoutesPath}`);
      }
      
      // Run the build command with the temporary config
      console.log('Running Vite build with custom config...');
      await runCommand('npx vite build --config vite.config.build.ts');
      
      // Clean up the temporary files
      console.log('Cleaning up temporary files...');
      try {
        await fs.unlink(tempConfigPath);
        console.log(`Removed temporary config ${tempConfigPath}`);
      } catch (err) {
        console.error(`Error cleaning up: ${err.message}`);
      }
      
      console.log('Build completed successfully!');
    } catch (err) {
      console.error(`Error creating temporary config: ${err.message}`);
      process.exit(1);
    }
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

// Helper function to check if a file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Run the build
build(); 