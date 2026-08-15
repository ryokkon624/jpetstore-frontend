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
      stockIn: 'In Stock',
      stockLow: 'Low Stock',
      stockOut: 'Out of Stock',
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
