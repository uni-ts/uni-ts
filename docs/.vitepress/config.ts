import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import { defineConfig } from 'vitepress';

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
    sidebar: [
      {
        text: 'Getting Started',
        link: '/getting-started',
      },
      {
        text: 'Result',
        items: [{ text: 'Getting Started', link: '/result/getting-started' }],
      },
      {
        text: 'Model',
        items: [{ text: 'Getting Started', link: '/model/getting-started' }],
      },
      {
        text: 'Composition',
        items: [{ text: 'Getting Started', link: '/composition/getting-started' }],
      },
      {
        text: 'Action',
        items: [{ text: 'Getting Started', link: '/action/getting-started' }],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/uni-ts/uni-ts' }],
  },
  markdown: {
    codeTransformers: [transformerTwoslash()],
    languages: ['js', 'ts'],
  },
});
