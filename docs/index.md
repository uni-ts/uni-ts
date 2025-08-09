---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

title: 'UniTS: Type-safe functional utilities'

hero:
  name: 'UniTS'
  text: 'Type-safe functional utilities'
  tagline: 'Make your TypeScript projects cleaner, safer, and more composable.'
  image:
    src: /logo.svg
    alt: UniTS logo
    width: 150
  actions:
    - theme: brand
      text: Get Started
      link: /docs/
    - theme: alt
      text: View on GitHub
      link: https://github.com/uni-ts/uni-ts

features:
  - icon: 🎬
    title: '@uni-ts/action'
    details: 'Type-safe action pipelines with context sharing and error handling - build composable middleware chains with full TypeScript support.'
    link: /docs/action/

  - icon: 🔀
    title: '@uni-ts/composition'
    details: 'Type-safe function composition - transform nested calls into readable pipelines with async support and perfect type inference.'
    link: /docs/composition/

  - icon: 🏗️
    title: '@uni-ts/model'
    details: 'Universal data modeling with validation - create type-safe models that work seamlessly with Zod, Valibot, ArkType, and more.'
    link: /docs/model/

  - icon: 🛡️
    title: '@uni-ts/result'
    details: 'Explicit error handling without exceptions - make errors visible and type-safe using Result type with related utilities.'
    link: /docs/result/
---
