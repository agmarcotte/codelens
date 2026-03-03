import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Performance-optimized Vite configuration
 * Use this for production builds with maximum optimization
 */
export default defineConfig({
  plugins: [
    react({
      // Babel options for optimization
      babel: {
        plugins: [
          // Remove console.log in production
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
    }),
  ],

  // Build optimizations
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps for debugging (disable in production)
    sourcemap: false,
    
    // Minification
    minify: 'esbuild',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'editor-vendor': ['@monaco-editor/react', 'monaco-editor'],
          'state-vendor': ['zustand', '@tanstack/react-query'],
          'utils-vendor': ['axios', 'mermaid'],
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
        
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inlining threshold (10kb)
    assetsInlineLimit: 10240,
    
    // Report compressed size
    reportCompressedSize: true,
    
    // Target modern browsers
    target: 'es2020',
  },

  // Optimization options
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'axios',
      'framer-motion',
      'lucide-react',
    ],
    exclude: ['@monaco-editor/react'],
  },

  // Server options
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false,
  },

  // Preview options
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: false,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Esbuild options
  esbuild: {
    // Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Minify identifiers
    minifyIdentifiers: true,
    // Minify syntax
    minifySyntax: true,
    // Minify whitespace
    minifyWhitespace: true,
  },

  // CSS options
  css: {
    // CSS modules configuration
    modules: {
      localsConvention: 'camelCase',
    },
    // PostCSS configuration
    postcss: './postcss.config.js',
    // Preprocessor options
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
});