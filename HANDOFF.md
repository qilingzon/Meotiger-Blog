# HANDOFF —— 交接文档（tiger-blog / 萌虎池塘）

> 新会话开场白：「读取本文件，继续 <当前任务>」。每次收尾随手更新。

## 当前状态

- 工程：D:\zcodework\tiger-blog / Astro 5.18.2 纯静态博客 + 自研萌虎 CMS（`public/admin/` + `edge-functions/`）/ 三主题：pink-soft（粉虎·奶油，默认）/ purple-pixel（紫虎·像素）/ lumen-cave（荧光洞窟）
- **立项（2026-10-25）**：用户在「①保留上线 / ②立项萌虎blog / ③回退」中选定 ②，自 D:\zcodework\blog（美西螈池塘）整体迁出成立本项目。迁出内容 = 旧仓工作树（已含萌虎试装全套：抠图管线 + 七色重上色 + 全站品牌文案）复制，并做三类处理：
  - **排除旧螈资产**：`public/assets/axolotl-*.png` ×7 + launcher 原图、旧 favicon ×7 + favicon.svg、`scripts/generate-variants.mjs`、`scripts/sample-official.mjs`、旧截图证据、`.mimosa/`
  - **全站更名 Axolotl→Tiger**：组件 `Tiger.astro`/`TigerRandom.astro`，CSS 类 `.tiger`/`.tiger-pick`/`.splash__tiger`，存储键 `tiger-theme`/`tiger-splash-seen`，CMS 默认账号 `tiger-admin`，GitHub 令牌描述 `Tiger-CMS`，`REPO_DEFAULT qilingzon/Tiger-Blog`，package.json `tiger-blog`
  - **文档重写**：README / README-CMS / AGENTS / HANDOFF；吉祥物源图入库 `design-assets/tiger/src.jpg`（用户 AI 自绘，出处凭证）
  - 吉祥物管线：`scripts/make-tiger.mjs`（泛洪抠底 + 近黑像素中性保眼睛 + 亮度 P5–P95 拉伸 + 粉虎固定饱和四阶锚点 #d64f7e→#fdd0e0）→ `public/assets/tiger-*.png` ×7（512×669 竖版）+ `favicon-tiger-*.png` ×7
  - 用户文章一字未动（旧文里的美西螈字样是历史内容，见 AGENTS.md）
- 进度：功能与旧仓完全一致（含小白写作模式/块编辑器、CMS 全部修复）；build/截图验收进行中
- 下一步（都需要用户参与）：
  - GitHub 建仓 `qilingzon/Tiger-Blog` 并 push（push 到远程属外发动作，先征得同意）
  - EdgeOne Pages 接新仓库；域名分配（替换 www.iqii.cn 还是新子域）用户定
  - CMS 四个环境变量重新配置（`node scripts/cms-setup.mjs` 或 `admin/setup.html`；**不要复用旧仓凭据**）
  - 页脚备案号（用户已备案，号码未提供——`Footer.astro` 加一行即可）
  - 旧仓 D:\zcodework\blog 的萌虎试装工作区改动：等用户确认后回退（内容已全部保存在本项目）

## 已验证的流程配方

- 构建：`npm install && npm run build`
- 本地预览：`npm run preview`（http://localhost:4321）
- 本地 CMS 全链路：`node scripts/cms-dev.mjs`（8090，读 `.env.local`）
- 无头截图：`msedge --headless=new --user-data-dir=<独立临时目录> --window-size=W,H --virtual-time-budget=6000 --screenshot=<绝对路径> "<url>"`（连续截多张必须换 user-data-dir，否则静默失败；需走本地 HTTP）
- 主题预览链接：任意页加 `?theme=pink-soft|purple-pixel|lumen-cave`（优先于 localStorage，不写入）
- 重生成吉祥物：`node scripts/make-tiger.mjs`（改锚点后跑，输出位图 + favicon 全套）
- 备份：项目根目录 `bash backup.sh` → git bundle 到 `D:\zcodework\_backups\`

## 踩坑清单（自旧仓继承，新会话重读一遍）

- **主题变量必须写 `:root[data-theme='x']`**：裸 `:root` 与 `[data-theme]` 特异性相同，打包后顺序不可控会互相覆盖。
- **preview 服务器别用后台 Bash 任务跑**（stdin 关闭后 astro preview 静默退出）；用 PowerShell 独立进程 `Start-Process -WindowStyle Hidden node -ArgumentList "node_modules\astro\astro.js","preview","--port","4321" -WorkingDirectory <项目> -RedirectStandardOutput preview.log -RedirectStandardError preview.err.log`。
- **EdgeOne 边缘运行时 atob 不容忍 base64 换行**：GitHub contents API 的 base64 每 60 字符夹换行，`b64ToBytes` 解码前 strip `\s+`（本地 Node Buffer 容忍换行所以本地测不出来，别删 strip）。
- Astro 组件里 `<style set:html={...}>` 不输出；动态规则写 global.css 或 `<style is:inline>`。
- Astro 草稿（draft:true）不生成页面；临时测试文章要 draft:false。
- CMS 本地测试注入环境变量用 `CMS_SESSION_SECRET`/`CMS_GITHUB_TOKEN`（不是 SESSION_SECRET/GITHUB_TOKEN）。
- AX/computer-use：setValue 打中文会被输入法吞（改用剪贴板粘贴）；getAXState 连续调用会 no_change/截断（先 getScreenshot 再取状态）。
- 萌虎位图 512×669 竖版，组件高度按 `size*669/512` 计算——将来换底图先改这个比例。
- Git Bash curl 命令行传中文会 GBK 乱码：测试 JSON 用 `--data-binary @文件`。

## 其他

- 安全：`.env.local` 凭据纪律见 AGENTS.md；edge function 出站白名单仅 api.github.com；登录 token HMAC 12h + 连错 5 次锁 15 分钟。不要把后台密码发进聊天，探测一律用假凭据。
- 旧仓（美西螈池塘）保留完整 git 历史与素材作为档案，两仓此后各自演化。
- 验收证据：`design-assets/tiger/preview/v3-*.png`（迁出前 home/about/admin 三页截图）。
