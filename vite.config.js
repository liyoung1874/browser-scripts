import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn, util } from "vite-plugin-monkey";

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: "src/main.js",
      userscript: {
        name: "Weibo auto sign and post.",
        noframse: true,
        author: "https://liyoung1874.github.io/",
        namespace: "https://liyoung1874.github.io/",
        match: ["https://weibo.com/p*"],
        description: "Weibo auto register and post. 微博自动签到和发帖。",
        license: "MIT",
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr("Vue", "dist/vue.global.prod.js").concat(
            await util.fn2dataUrl(() => {
              // @ts-ignore
              window.Vue = Vue;
            })
          ),
          "element-plus": cdn.jsdelivr("ElementPlus", "dist/index.full.min.js"),
        },
        externalResource: {
          "element-plus/dist/index.css": cdn.jsdelivr(),
        },
      },
    }),
  ],
});
