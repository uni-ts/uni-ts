---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

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
  - title: 🛡️ Safe Error Handling
    details: 'Replace try-catch with Result types. Handle errors explicitly with Ok/Err patterns, inspired by Rust and functional languages.'

  - title: 🔗 Function Composition
    details: 'Chain operations seamlessly with flow() and pipe(). Build complex data transformations from simple, reusable functions.'

  - title: ✅ Type-safe Validation
    details: 'Validate data with full type safety using Standard Schema. Transform and validate with confidence at runtime.'

  - title: 🧩 Composable Actions
    details: 'Build complex workflows from simple actions. Chain operations with built-in error handling, context, and type safety.'
---
