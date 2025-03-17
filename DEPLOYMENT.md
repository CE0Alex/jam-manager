# Deployment Guide for Jam Manager

This guide provides detailed instructions for deploying the Jam Manager application to Vercel.

## Prerequisites

- A GitHub account with the repository pushed
- A Vercel account (free tier is sufficient)
- Supabase project set up with the necessary tables and authentication

## Deployment Steps

### 1. Prepare Your Environment Variables

Create a `.env.production` file in your project root with the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Replace the values with your actual Supabase project URL and anonymous key.

### 2. Prepare Your Project for Deployment

The project is already configured for Vercel deployment with:

- `vercel.json` - Contains routing and build configuration
- `vite.config.ts` - Configured for production builds
- `package.json` - Contains the necessary build scripts

### 3. Deploy to Vercel

#### Option 1: Using the Vercel Dashboard (Recommended for First Deployment)

1. Log in to your Vercel account at https://vercel.com
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
6. Click "Deploy"

#### Option 2: Using the Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project directory:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project
5. For production deployment:
   ```bash
   vercel --prod
   ```

### 4. Verify Your Deployment

1. Once deployed, Vercel will provide a URL for your application
2. Visit the URL to ensure everything is working correctly
3. Test key functionality:
   - User authentication
   - Job creation and management
   - PDF parsing
   - Production scheduling

### 5. Custom Domain (Optional)

1. In the Vercel dashboard, go to your project settings
2. Click on "Domains"
3. Add your custom domain and follow the instructions to configure DNS

### 6. Troubleshooting Common Issues

#### PDF.js Worker Not Loading

If the PDF.js worker fails to load in production:

1. Check the browser console for errors
2. Verify that the worker is being loaded from the CDN:
   ```javascript
   pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
   ```

#### Build Errors

If you encounter build errors:

1. Try building locally first:
   ```bash
   npm run build
   ```

2. Check for TypeScript errors:
   ```bash
   npm run type-check
   ```

3. If TypeScript errors are preventing the build, you can temporarily bypass them by modifying the build script in `package.json`:
   ```json
   "build": "vite build"
   ```

#### API Connection Issues

If the application can't connect to Supabase:

1. Verify your environment variables are correctly set in Vercel
2. Check that your Supabase project is active and accessible
3. Ensure your Supabase security rules allow the necessary operations

### 7. Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository:

1. Any push to the main branch will trigger a new deployment
2. You can configure preview deployments for pull requests
3. You can set up custom deployment hooks for specific branches or events

## Conclusion

Your Jam Manager application should now be successfully deployed to Vercel. The application will automatically update whenever you push changes to your GitHub repository. 