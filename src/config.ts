// 站点全局配置
export const SITE = {
  name: '萌虎池塘',
  nameEn: 'Tiger Pond',
  description: '一只紫虎和一只粉虎守护的个人博客：技术、生活与像素世界。',
  author: '紫虎 & 粉虎',
  nav: [
    { href: '/', label: '首页' },
    { href: '/blog/', label: '文章' },
    { href: '/search/', label: '搜索' },
    { href: '/about/', label: '关于' },
  ],
};

/** 主题注册表：id 与 global.css 的 [data-theme] 及切换脚本保持一致 */
export const THEMES = [
  { id: 'pink-soft', label: '粉虎·奶油', dot: '#EE6FA7' },
  { id: 'purple-pixel', label: '紫虎·像素', dot: '#7C4DFF' },
  { id: 'lumen-cave', label: '荧光洞窟', dot: '#C77DFF' },
] as const;

export const THEME_STORAGE_KEY = 'tiger-theme';
