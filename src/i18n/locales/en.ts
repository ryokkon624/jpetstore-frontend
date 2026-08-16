// 英語のみ（PO決定・Refinement 2026-08-11）。日本語は将来スプリント(#25)。
// キー構造: domain.context.key（frontend-conventions 準拠）
export default {
  app: {
    header: {
      logoAlt: 'JPetStore',
      navLabel: 'Primary',
      nav: {
        home: 'Home',
        catalog: 'Catalog',
        cart: 'Cart',
      },
      account: {
        signIn: 'Sign In',
        signOut: 'Sign Out',
        greeting: 'Hi, {username}',
      },
      search: {
        label: 'Search products',
        placeholder: 'Search products…',
      },
    },
  },
  home: {
    hero: {
      eyebrow: 'Reimagined for the modern web',
      title: 'Bringing you closer to the pets you love.',
      lead: 'Fish, dogs, cats, reptiles, and birds — JPetStore is your online pet store for finding your perfect companion.',
      browseCatalog: 'Browse Catalog',
      newHere: 'New Here?',
    },
    tokens: {
      title: 'Design Token Check',
      desc: 'A verification slot confirming the CSS custom properties (--jps-primary / --jps-accent / --jps-surface, etc.) and the \\@layer classes defined in main.css work as expected.',
    },
  },
  catalog: {
    breadcrumb: {
      home: 'Home',
      catalog: 'Catalog',
    },
    category: {
      title: 'Shop by Category',
      lead: 'Browse our pet categories to find your perfect companion.',
    },
    product: {
      itemsTitle: 'Available Items',
    },
    item: {
      addToCart: 'Add to Cart',
      addToCartComingSoon: 'Coming soon',
    },
    table: {
      itemId: 'Item ID',
      description: 'Description',
      price: 'Price',
      stock: 'Stock',
    },
    pagination: {
      navLabel: 'Pagination',
      previous: 'Previous',
      next: 'Next',
    },
    stockStatus: {
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outStock: 'Out of Stock',
      unknown: 'Unknown',
    },
    empty: {
      categories: 'No categories found.',
      products: 'No products found in this category.',
      items: 'No items found for this product.',
    },
    error: {
      title: 'Something went wrong',
      desc: 'We could not load this page. Please try again later.',
    },
    search: {
      title: 'Search Results',
      resultsFor: 'Results for "{keyword}"',
      categoryFilter: {
        label: 'Category',
        all: 'All Categories',
      },
      emptyKeyword: 'Please enter a keyword to search.',
      noResults: 'No products found for "{keyword}".',
    },
  },
  auth: {
    signon: {
      title: 'Sign In',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      submit: 'Sign In',
      submitting: 'Signing in…',
      error: 'Invalid username or password.',
    },
  },
} as const
