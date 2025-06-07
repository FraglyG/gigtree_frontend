// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';

import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 80,
  },
  vite: {
    resolve: {
      alias: {
        "@": path.join(process.cwd(), 'src'),
      }
    }
  },
  integrations: [vue(), tailwind({ applyBaseStyles: false })],
  env: {
    schema: {
      PUBLIC_BACKEND_URL: {
        type: 'string',
        context: 'client',
        access: 'public',
      },
      PUBLIC_CDN_URL: {
        type: 'string',
        context: 'client',
        access: 'public',
      }
    }
  }
});