import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    /** 卡片装饰萌虎的颜色（七色家族：粉紫棕青金蓝绿） */
    accent: z
      .enum(['pink', 'purple', 'wild', 'cyan', 'gold', 'blue', 'green'])
      .default('pink'),
    /** 草稿：true 时前台（列表/首页/搜索/详情页）不生成 */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
