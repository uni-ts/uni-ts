import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import { defineConfig } from 'vitepress';
import typedocSidebar from '../api/typedoc-sidebar.json';

const title = 'UniTS';
const description = 'A set of utilities to make your TypeScript projects cleaner, safer, and more composable.';
const logo = '/logo.svg';

export default defineConfig({
  title,
  description,
  cleanUrls: true,
  sitemap: {
    hostname: 'https://uni-ts.dev',
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: logo }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: logo }],
    ['meta', { property: 'og:url', content: 'https://uni-ts.dev' }],
    ['meta', { property: 'og:site_name', content: title }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: logo }],
  ],
  themeConfig: {
    logo,
    nav: [
      {
        text: 'Docs',
        link: '/docs/',
      },
      {
        text: 'API Reference',
        link: '/api/',
      },
    ],
    sidebar: {
      '/docs/': [
        { text: 'About the project', link: '/docs/' },
        {
          text: '🛡️ Result',
          collapsed: true,
          items: [
            { text: 'Introduction', link: '/docs/result/' },
            { text: 'Getting started', link: '/docs/result/getting-started' },
          ],
        },
        {
          text: '🏗️ Model',
          collapsed: true,
          items: [
            { text: 'Introduction', link: '/docs/model/' },
            { text: 'Getting started', link: '/docs/model/getting-started' },
          ],
        },
        {
          text: '🔀 Composition',
          collapsed: true,
          items: [
            { text: 'Introduction', link: '/docs/composition/' },
            { text: 'Getting started', link: '/docs/composition/getting-started' },
          ],
        },
        {
          text: '🎬 Action',
          collapsed: true,
          items: [
            { text: 'Introduction', link: '/docs/action/' },
            { text: 'Getting started', link: '/docs/action/getting-started' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: typedocSidebar,
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/uni-ts/uni-ts' }],
  },
  markdown: {
    codeTransformers: [
      transformerTwoslash({
        twoslashOptions: {
          compilerOptions: {
            strict: true,
            paths: {
              '@uni-ts/result': ['packages/result/src/index.ts'],
              '@uni-ts/result/fp': ['packages/result/src/fp.ts'],
              '@uni-ts/result/builder': ['packages/result/src/builder.ts'],
              '@uni-ts/composition': ['packages/composition/src/index.ts'],
              '@uni-ts/composition/builder': ['packages/composition/src/builder.ts'],
              '@uni-ts/model': ['packages/model/src/index.ts'],
              '@uni-ts/model/safe': ['packages/model/src/safe.ts'],
              '@uni-ts/action': ['packages/action/src/index.ts'],
              '@uni-ts/action/safe': ['packages/action/src/safe.ts'],
            },
          },
        },
      }),
    ],
    languages: ['js', 'ts'],
  },
});
