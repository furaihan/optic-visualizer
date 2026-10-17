import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig, loadEnv} from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const resolvePath = (...segments: string[]) => path.resolve(root, ...segments);

export default defineConfig(({mode}) => {
  // Read from the mode-specific files (.env.development / .env.production / .env.local).
  // Deliberately NOT process.env: Bun auto-loads .env.development into process.env
  // regardless of Vite's mode, which would leak dev settings into a production build.
  const env = loadEnv(mode, root, '');
  const isProd = mode === 'production';

  const port = Number(env.PORT ?? (isProd ? 8080 : 3000));
  const host = env.HOST ?? '0.0.0.0';
  const strictPort = env.STRICT_PORT === 'true';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': resolvePath('.'),
        '@components': resolvePath('src/components'),
        '@hooks': resolvePath('src/hooks'),
        '@lib': resolvePath('src/lib'),
        '@data': resolvePath('src/data'),
        '@types': resolvePath('src/types'),
        '@shadcn': resolvePath('src/components/ui'),
        '@i18n': resolvePath('src/lib/translations'),
      },
    },
    server: {
      host,
      port,
      strictPort,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: env.DISABLE_HMR !== 'true',
    },
    preview: {
      host,
      port,
      strictPort,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('@base-ui') || id.includes('@tanstack')) return 'vendor-react';
              if (id.includes('lucide') || id.includes('motion')) return 'vendor-ui';
              return 'vendor';
            }
          }
        }
      }
    },
  };
});
