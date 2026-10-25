# 项目纪律（tiger-blog / 萌虎池塘）

> 领域特有规则写在这里。通用纪律见用户级 `~/.zcode/AGENTS.md`（事实源判定/回合纪律/重试熔断/破坏性操作确认/验收即宪法/git 纪律/备份），对所有项目自动生效。

- 萌虎吉祥物组件（`src/components/Tiger.astro` / `TigerRandom.astro`）是全站视觉核心：底图是**用户本人 AI 绘制**的立体像素萌虎（源图入库 `design-assets/tiger/src.jpg`，即出处凭证），七色变体（pink 粉 / purple 紫 / wild 棕 / cyan 青 / gold 金 / blue 蓝 / green 绿彩蛋）由 `node scripts/make-tiger.mjs` 按亮度梯重上色生成——改色先改脚本里的锚点色/RAMP 再重新生成，不要手改位图、不要引入 CSS 滤镜方案。改动需同时检查三个主题（pink-soft / purple-pixel / lumen-cave）下的呈现。
- 本项目是「美西螈池塘」（D:\zcodework\blog）的继任：代码同源，品牌与素材已整体换为萌虎。除吉祥物源图与变体外，站点零外部图片依赖：其余美术一律内联 SVG/CSS，新增图片资源需先征得同意。
- 主题切换必须持久化（localStorage `tiger-theme`），且 `<head>` 内联引导脚本防闪烁逻辑不能移除。
- 所有视觉改动完成后必须开 preview 截图过目（3 主题 × 关键页），截图作为验收证据。
- 萌虎 CMS（`public/admin/` + `edge-functions/api/[[default]].js`）：全中文界面，改动需同步检查三主题；API 出站白名单（仅 api.github.com）与端点白名单表（app.js 的 ENDPOINTS）是安全底线，不得放宽。本地调试用 `node scripts/cms-dev.mjs`。**`.env.local` 存放登录凭据与 GitHub 令牌：任何会话不得读取、打印、复制其内容到聊天、日志或网络，不得提交仓库或硬编码进代码；确需更换凭据由用户自行编辑该文件。**
- 文章内容放 `src/content/blog/*.md`，frontmatter 遵循 `src/content.config.ts` 的 schema（CMS 保存时会按 schema 序列化，改字段要同步 CMS 表单与 API 的 normalizeMeta）。
- 用户文章（含旧文里的「美西螈」字样）是历史内容，品牌改名**不动文章正文与文件名**；全站品牌残留扫描时 `src/content/blog/` 目录除外。
