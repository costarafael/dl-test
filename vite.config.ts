import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do arquivo .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Configurações de resolução de módulos
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: /^~(.+)/, replacement: '$1' },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    // Configurações do servidor de desenvolvimento
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT || '5174', 10),
      open: true,
      host: true,
    },
    // Configurações de build
    build: {
      outDir: env.VITE_OUT_DIR || 'dist',
      sourcemap: env.VITE_SOURCE_MAP === 'true',
      minify: 'esbuild',
      chunkSizeWarningLimit: 1600,
    },
    // Configurações de CSS
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables";`,
        },
      },
    },
    // Configurações de otimização
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      esbuildOptions: {
        target: 'es2020',
      },
    },
    define: {
      'process.env': {},
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
    },
  };
});
