import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { glob } from 'glob';

import liveReload from 'vite-plugin-live-reload';

function moveOutputPlugin() {
  return {
    name: 'move-output',
    enforce: 'post',
    apply: 'build',
    async generateBundle(options, bundle) {
      for (const fileName in bundle) {
        if (fileName.startsWith('pages/')) {
          const newFileName = fileName.slice('pages/'.length);
          bundle[fileName].fileName = newFileName;
        }
      }
    },
  };
}

export default defineConfig(({ command, mode }) => {
    // 判斷是否為開發環境
  const isDev = command === 'serve';

  return {
    // base 的寫法:
    // base: '/Repository 的名稱/'
    base:'/wk5/',
    define: {
      // 定義全域變數
      __IS_DEV__: isDev,
    },    
    plugins: [
      liveReload(['./layout/**/*.ejs', './pages/**/*.ejs', './pages/**/*.html']),
      ViteEjsPlugin({
        // 傳遞環境變數給 EJS
        isDev,
        // 建立路徑輔助函數
        getPagePath: (pageName) => {
          return isDev ? `/wk5/pages/${pageName}` : `/wk5/${pageName}`;
        }
      }),
      moveOutputPlugin(),
    ],
    server: {
      // 啟動 server 時預設開啟的頁面
      open: 'pages/index.html',
    },
    build: {
      rollupOptions: {
        input: Object.fromEntries(
          glob
            .sync('pages/**/*.html')
            .map((file) => [
              path.relative(
                'pages',
                file.slice(0, file.length - path.extname(file).length)
              ),
              fileURLToPath(new URL(file, import.meta.url)),
            ])
        ),
      },
      outDir: 'dist',
    },
  }
});
