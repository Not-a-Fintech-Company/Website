import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://notafintech.co',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [
    starlight({
      title: 'Not a Fintech Company',
      description: 'Open Sourcing the rest of Fintech.',
      logo: {
        src: './src/assets/logo.svg',
      },
      favicon: '/favicon.png',
      components: {
        Footer: './src/components/Footer.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/Not-a-Fintech-Company/Website' },
      ],
      sidebar: [
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Models',
          autogenerate: { directory: 'models' },
        },
        {
          label: 'Docs',
          autogenerate: { directory: 'docs' },
        },
        {
          label: 'Resources',
          slug: 'resources',
        },
        {
          label: 'About',
          slug: 'about',
        },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
      head: [
        // Plausible Analytics
        {
          tag: 'script',
          attrs: {
            async: true,
            src: 'https://plausible.io/js/pa-W0Dq5s5xrg0nZbo6PsWi5.js',
          },
        },
        {
          tag: 'script',
          content: "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()",
        },
        // Google Analytics
        {
          tag: 'script',
          attrs: {
            async: true,
            src: 'https://www.googletagmanager.com/gtag/js?id=G-VJXL7WCFNM',
          },
        },
        {
          tag: 'script',
          content: "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-VJXL7WCFNM');",
        },
        // Apple touch icon
        {
          tag: 'link',
          attrs: {
            rel: 'apple-touch-icon',
            sizes: '180x180',
            href: '/apple-touch-icon.png',
          },
        },
        // OpenGraph image (default for all pages)
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://notafintech.co/og-image.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:width',
            content: '1200',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:height',
            content: '630',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:type',
            content: 'image/png',
          },
        },
        // Twitter card
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:card',
            content: 'summary_large_image',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:image',
            content: 'https://notafintech.co/og-image.png',
          },
        },
        // Additional SEO
        {
          tag: 'meta',
          attrs: {
            name: 'theme-color',
            content: '#284B9C',
          },
        },
      ],
    }),
  ],
});
