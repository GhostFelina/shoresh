import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { aliases } from './aliases';

export default defineConfig({
  plugins: [react()],
  // Takma adlar tek kaynaktan; vite.config.ts ile ayrı düşemez.
  resolve: { alias: aliases },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: { provider: 'v8', reportsDirectory: './coverage' },
  },
});
