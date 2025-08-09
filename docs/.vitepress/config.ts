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
    hostname: 'https://uni-ts.pages.dev',
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: logo }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: logo }],
    ['meta', { property: 'og:url', content: 'https://uni-ts.pages.dev' }],
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
          text: '🎬 Action',
          collapsed: true,
          items: [
            { text: 'Introduction', link: '/docs/action/' },
            { text: 'Getting started', link: '/docs/action/getting-started' },
            { text: 'Basic utilities', link: '/docs/action/basic-utilities' },
            { text: 'Safe utilities', link: '/docs/action/safe-utilities' },
            { text: 'Best practices', link: '/docs/action/best-practices' },
          ],
        },
        {
          text: '🔀 Composition',
          collapsed: true,
          items: [
            { text: 'Introduction', link: '/docs/composition/' },
            { text: 'Getting started', link: '/docs/composition/getting-started' },
            { text: 'Best practices', link: '/docs/composition/best-practices' },
          ],
        },
        {
          text: '🏗️ Model',
          collapsed: true,
          items: [
            { text: 'Introduction', link: '/docs/model/' },
            { text: 'Getting started', link: '/docs/model/getting-started' },
            { text: 'Basic utilities', link: '/docs/model/basic-utilities' },
            { text: 'Safe utilities', link: '/docs/model/safe-utilities' },
            { text: 'Best practices', link: '/docs/model/best-practices' },
          ],
        },
        {
          text: '🛡️ Result',
          collapsed: true,
          items: [
            { text: 'Introduction', link: '/docs/result/' },
            { text: 'Getting started', link: '/docs/result/getting-started' },
            { text: 'Basic utilities', link: '/docs/result/basic-utilities' },
            { text: 'Builder flow', link: '/docs/result/builder-flow' },
            { text: 'Functional composition', link: '/docs/result/functional-composition' },
            { text: 'Best Practices', link: '/docs/result/best-practices' },
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
            noImplicitReturns: true,
            paths: {
              '@uni-ts/result': ['packages/result/src/index.ts'],
              '@uni-ts/result/fp': ['packages/result/src/fp.ts'],
              '@uni-ts/result/builder': ['packages/result/src/builder.ts'],
              '@uni-ts/composition': ['packages/composition/src/index.ts'],
            },
          },
        },
      }),
    ],
    languages: ['js', 'ts'],
  },
});
