// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3001,
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