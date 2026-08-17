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
      addedToCart: 'Added to your cart.',
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
  cart: {
    breadcrumb: 'Cart',
    title: 'Your Cart',
    table: {
      item: 'Item',
      price: 'Price',
      quantity: 'Quantity',
      subtotal: 'Subtotal',
      remove: 'Remove',
    },
    subtotalLabel: 'Subtotal',
    checkout: 'Proceed to Checkout',
    remove: 'Remove',
    exceedsStockWarning:
      'Stock has changed since this item was added; the quantity may exceed availability.',
    empty: {
      title: 'Your cart is empty',
      desc: 'Browse the catalog to find something for your pet.',
      browseCatalog: 'Browse Catalog',
    },
    error: {
      title: 'Something went wrong',
      desc: 'We could not load your cart. Please try again later.',
    },
    addError: {
      OUT_OF_STOCK: 'This item is currently out of stock.',
      EXCEEDS_STOCK: 'The requested quantity exceeds the available stock.',
      INVALID_QUANTITY: 'Please enter a valid quantity.',
      default: 'Could not update your cart. Please try again.',
    },
    // #7 AC-neg1: 空カートでチェックアウトに進もうとした場合の正規化エラー(as-is failure文言相当)。
    checkoutEmptyError: 'An order could not be created because a cart could not be found.',
  },
  checkout: {
    breadcrumb: 'Checkout',
    steps: {
      cart: 'Cart',
      address: 'Address',
      confirm: 'Confirm',
    },
    cartStep: {
      title: 'Review Your Cart',
      continue: 'Continue to Address',
    },
    addressStep: {
      title: 'Shipping & Billing Address',
      billingTitle: 'Billing Address',
      shippingTitle: 'Shipping Address',
      useSeparateShipping: 'Ship to a different address',
      back: 'Back to Cart',
      continue: 'Continue to Confirmation',
      fields: {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        address1: 'Address',
        address2: 'Address 2',
        city: 'City',
        state: 'State',
        postalCode: 'Postal Code',
        country: 'Country',
      },
    },
    confirmStep: {
      title: 'Review & Confirm',
      billingTitle: 'Billing Address',
      shippingTitle: 'Shipping Address',
      paymentTitle: 'Payment',
      // AC3: カード入力欄は置かず明示プレースホルダのみ表示する(F3.6承認済)。
      paymentPlaceholder: 'Payment details will be added in a future update.',
      back: 'Back to Address',
      placeOrder: 'Place Order',
      // #8: 送信中の表示文言。
      placing: 'Placing your order…',
      placeOrderError: {
        // #8 AC2/AC-neg2: 409(在庫不足・同時発注の競合負け)は専用文言、それ以外は一律defaultへ丸める。
        INSUFFICIENT_STOCK:
          'One or more items in your order are no longer available in the requested quantity. Please review your cart and try again.',
        default: 'We could not place your order. Please try again.',
      },
    },
  },
  // #8: 最小の完了画面(注文番号・サーバ再計算合計・サンクスメッセージのみ。明細/商品名は#10)。
  orderComplete: {
    title: 'Thank you for your order!',
    message: 'Your order has been placed successfully.',
    orderNumberLabel: 'Order number',
    totalLabel: 'Total',
    continueShopping: 'Continue Shopping',
  },
} as const
