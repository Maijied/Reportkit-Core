export type DocsNavItem = {
  title: string;
  slug: string;
};

export type DocsNavGroup = {
  title: string;
  items: DocsNavItem[];
};

export const docsNav: DocsNavGroup[] = [
  {
    title: 'Getting started',
    items: [
      { title: 'Introduction', slug: 'getting-started/introduction' },
      { title: 'Quick start', slug: 'getting-started/quick-start' },
      { title: 'Installation', slug: 'getting-started/installation' },
      { title: 'Compatibility', slug: 'getting-started/compatibility' },
    ],
  },
  {
    title: 'Adapters',
    items: [
      { title: 'Laravel 5.5–13', slug: 'adapters/laravel' },
      { title: 'Laravel 4.1–5.4', slug: 'adapters/laravel-legacy' },
      { title: 'Plain PHP', slug: 'adapters/plain-php' },
    ],
  },
  {
    title: 'Core concepts',
    items: [
      { title: 'Architecture', slug: 'core/architecture' },
      { title: 'Report definitions', slug: 'core/definitions' },
      { title: 'RowSource', slug: 'core/row-source' },
      { title: 'Week chunking', slug: 'core/week-chunking' },
      { title: 'PseudoPaginator', slug: 'core/pseudo-paginator' },
      { title: 'DataTableResponder', slug: 'core/datatable-responder' },
    ],
  },
  {
    title: 'Multiple databases',
    items: [
      { title: 'Overview', slug: 'multi-database/overview' },
      { title: 'MergedRowSource', slug: 'multi-database/merged-row-source' },
      { title: 'Laravel dual-DB', slug: 'multi-database/laravel' },
    ],
  },
  {
    title: 'UI',
    items: [
      { title: 'Overview', slug: 'ui/overview' },
      { title: 'CSS tokens', slug: 'ui/css' },
      { title: 'JavaScript API', slug: 'ui/js' },
    ],
  },
  {
    title: 'Export',
    items: [{ title: 'CSV & filenames', slug: 'export/overview' }],
  },
  {
    title: 'Artisan',
    items: [{ title: 'Commands', slug: 'artisan/commands' }],
  },
  {
    title: 'API reference',
    items: [{ title: 'Core API', slug: 'api/core' }],
  },
  {
    title: 'About',
    items: [
      { title: 'Lorapok Labs', slug: 'about/lorapok' },
      { title: 'Scale honesty', slug: 'about/scale' },
    ],
  },
];

export function flattenDocsNav(): DocsNavItem[] {
  return docsNav.flatMap((g) => g.items);
}

export function findDocsNeighbors(slug: string) {
  const all = flattenDocsNav();
  const i = all.findIndex((item) => item.slug === slug);
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}
