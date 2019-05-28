const siteConfig = {
  title: 'Themis',
  tagline: 'A CLI to support a modular GraphQL server.',
  url: '#give-me-url',
  baseUrl: '/',
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'themis-graphql',
  organizationName: 'spring-media',

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'what', label: 'Docs' },
    { page: 'roadmap', label: 'Roadmap' },
  ],

  /* path to images for header/footer */
  headerIcon: 'img/GraphQL_Logo.svg',
  favicon: 'img/GraphQL_Logo.svg',

  /* Colors for website */
  colors: {
    primaryColor: '#0A3F57',
    secondaryColor: '#6FE3C4',
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Spring-Media`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js',
    '/js/code-block-buttons.js',
  ],
  stylesheets: ['/css/code-block-buttons.css'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,
};

module.exports = siteConfig;
