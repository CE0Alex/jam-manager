# Jam Manager (Supabase Version)

This is the Supabase-integrated version of Jam Manager, migrated from localStorage to Supabase for data persistence. The application now supports:

- Cloud-based data storage with Supabase PostgreSQL
- Local data fallback if connection fails
- Fixed scheduling bugs for better reliability
- Improved timezone handling
- Standardized conflict detection

## Migration Details

The original localStorage-based app has been migrated to use Supabase as the backend. Key changes:

- Added Supabase client and utilities in `src/lib/supabase/`
- Updated AppContext.tsx to use Supabase for CRUD operations
- Fixed scheduling functionality bugs
- Added data conversion utilities between frontend and Supabase models

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

# Jam Manager

A production management system for print shops and creative studios.

## Features

- Job management and tracking
- Staff scheduling and workload management
- Production calendar with smart scheduling
- PDF job ticket parsing
- Dashboard with real-time metrics

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Vercel

This project is configured for easy deployment to Vercel.

### Automatic Deployment

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Vite framework
3. Set the following environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Manual Deployment

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy from the project directory:
   ```bash
   vercel
   ```

3. For production deployment:
   ```bash
   vercel --prod
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### PDF Parsing Issues

If you encounter issues with PDF parsing:

1. Ensure the PDF.js worker is properly loaded
2. Check browser console for any errors
3. Try using a CDN version of the worker by setting:
   ```javascript
   pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
   ```

### Build Errors

If you encounter TypeScript errors during build:

1. Run `npm run build` without TypeScript checking:
   ```bash
   # In package.json
   "build": "vite build"
   ```

2. Manually check types before deployment:
   ```bash
   npm run type-check
   ```
# Deployed version with Supabase integration
