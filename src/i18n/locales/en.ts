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
        // #34 AC1: 認証済み時のみ表示するナビ導線(注文履歴/アカウント設定)。
        orders: 'Orders',
        account: 'Account',
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
      // #36 AC1: ヘッダーのテーマ設定ドロップダウン(アイコン+Light/Dark/Systemの3択)。
      settings: {
        theme: {
          label: 'Theme',
          options: {
            system: 'System',
            light: 'Light',
            dark: 'Dark',
          },
        },
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
  // #13: ユーザー登録画面。langpref/favcategory入力欄は持たない(E5・サーバ既定値/未設定で登録される)。
  // #14: アカウント/プロフィール編集画面(本人固定・version楽観ロック)。
  // #15: パスワード変更画面(現在PW再認証必須・成功時セッションローテート)。
  // #17: 入力検証(email形式・最大長・PW強度)の共有インラインエラーキー(validation)。
  account: {
    register: {
      title: 'Create Account',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      repeatedPasswordLabel: 'Confirm Password',
      submit: 'Create Account',
      submitting: 'Creating your account…',
      error: {
        // #13 E4: username重複は明示メッセージ(列挙対策はレート制限が担保する前提)。
        USERNAME_TAKEN: 'That username is already taken. Please choose another.',
        RATE_LIMITED: 'Too many attempts. Please wait a while and try again.',
        // #17retrofit: パスワード不一致に限らずemail形式/最大長/PW強度等の複数原因になり得る一般文言。
        VALIDATION_ERROR: 'Please check your information and try again.',
        default: 'We could not create your account. Please try again.',
      },
      // #13登録フォーム自身のクライアント側password一致プレチェック用(backendのVALIDATION_ERRORとは別経路)。
      passwordMismatch: 'Passwords do not match.',
    },
    edit: {
      title: 'Account Settings',
      submit: 'Save Changes',
      saving: 'Saving…',
      success: 'Your account has been updated.',
      error: 'We could not save your changes. Please try again.',
      loadError: 'We could not load your account. Please try again later.',
      // #14 AC3/AC-neg3: 409競合(新UX)は再読込を促す(既存order.tsの終端文言型とは別のフロー)。
      conflict:
        'This account was updated elsewhere. Please reload the latest version before saving again.',
      reload: 'Reload Latest',
      languagePreferenceLabel: 'Language Preference',
      languageOptions: {
        english: 'English',
        japanese: 'Japanese',
      },
      favoriteCategoryLabel: 'Favorite Category',
      favoriteCategoryNone: 'None',
      // #15 導線: 編集画面からPW変更画面へのリンク。
      changePasswordLink: 'Change Password',
    },
    password: {
      title: 'Change Password',
      currentPasswordLabel: 'Current Password',
      newPasswordLabel: 'New Password',
      confirmNewPasswordLabel: 'Confirm New Password',
      submit: 'Change Password',
      submitting: 'Changing Password…',
      success: 'Your password has been changed.',
      mismatch: 'New password and confirmation do not match.',
      error: {
        // #15 AC-neg1: 現在PW誤り(422)。
        INVALID_CURRENT_PASSWORD: 'Current password is incorrect.',
        WEAK_PASSWORD:
          'Password must be 8-72 characters and include at least 2 of: uppercase letters, lowercase letters, digits, symbols.',
        default: 'We could not change your password. Please try again.',
      },
    },
    // #17 AC3: register/edit/password共通のインラインフィールドエラー文言。
    validation: {
      emailInvalid: 'Please enter a valid email address.',
      tooLong: 'This field is too long.',
      weakPassword:
        'Password must be 8-72 characters and include at least 2 of: uppercase letters, lowercase letters, digits, symbols.',
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
      // #12 AC3(ID-8): カード入力欄は置かず、実カード情報を「扱わない」ことを明示するプレースホルダのみ表示する(F3.6承認済)。
      paymentPlaceholder: 'This demo does not collect or store card details.',
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
  // #9/#10: 注文履歴一覧・注文詳細(本人スコープ・所有者限定)。
  order: {
    history: {
      title: 'Order History',
      empty: 'You have no past orders.',
      table: {
        orderId: 'Order #',
        date: 'Date',
        total: 'Total',
      },
    },
    detail: {
      title: 'Order #{orderId}',
      totalLabel: 'Total',
      table: {
        product: 'Product',
        price: 'Price',
        quantity: 'Quantity',
        subtotal: 'Subtotal',
      },
      // AC-neg1/AC-neg2(SBD-1/SBD-8): 非所有・不存在を区別しない統一メッセージ(存在推測を与えない)。
      unavailable: {
        title: 'Order not found',
        desc: 'We could not find this order, or you do not have access to it.',
      },
    },
  },
} as const
