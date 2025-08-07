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
        {
          text: 'Getting Started',
          link: '/docs/',
        },
        {
          text: 'Result',
          items: [{ text: 'Getting Started', link: '/docs/result/getting-started' }],
        },
        {
          text: 'Model',
          items: [{ text: 'Getting Started', link: '/docs/model/getting-started' }],
        },
        {
          text: 'Composition',
          items: [{ text: 'Getting Started', link: '/docs/composition/getting-started' }],
        },
        {
          text: 'Action',
          items: [{ text: 'Getting Started', link: '/docs/action/getting-started' }],
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
    codeTransformers: [transformerTwoslash()],
    languages: ['js', 'ts'],
  },
});
