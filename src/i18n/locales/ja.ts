// #25: 日本語ローカライズ。en.ts とキー構造(shape)を完全にミラーする（未翻訳キーは
// fallbackLocale='en' で自動フォールバックし、サイレント失敗しない＝#25 AC5）。
export default {
  app: {
    header: {
      logoAlt: 'JPetStore',
      navLabel: 'メイン',
      nav: {
        home: 'ホーム',
        catalog: 'カタログ',
        cart: 'カート',
        orders: '注文履歴',
        account: 'アカウント',
      },
      account: {
        signIn: 'サインイン',
        signOut: 'サインアウト',
        greeting: 'こんにちは、{username}さん',
      },
      search: {
        label: '商品を検索',
        placeholder: '商品を検索…',
      },
      settings: {
        theme: {
          label: 'テーマ',
          options: {
            system: 'システム',
            light: 'ライト',
            dark: 'ダーク',
          },
        },
        language: {
          label: '言語',
          options: {
            en: 'English',
            ja: '日本語',
          },
        },
      },
    },
  },
  home: {
    hero: {
      eyebrow: '進化するモダンウェブへ',
      title: '大切なペットと、もっと近くに。',
      lead: '魚、犬、猫、爬虫類、鳥——JPetStore は、あなたにぴったりのパートナーを見つけるためのオンラインペットストアです。',
      browseCatalog: 'カタログを見る',
      newHere: 'はじめての方へ',
    },
  },
  catalog: {
    breadcrumb: {
      home: 'ホーム',
      catalog: 'カタログ',
    },
    category: {
      title: 'カテゴリから探す',
      lead: 'ペットのカテゴリから、ぴったりのパートナーを見つけましょう。',
    },
    product: {
      itemsTitle: '取扱商品',
    },
    item: {
      addToCart: 'カートに追加',
      addedToCart: 'カートに追加しました。',
    },
    table: {
      itemId: '商品ID',
      description: '説明',
      price: '価格',
      stock: '在庫',
    },
    pagination: {
      navLabel: 'ページ送り',
      previous: '前へ',
      next: '次へ',
    },
    stockStatus: {
      inStock: '在庫あり',
      lowStock: '残りわずか',
      outStock: '在庫切れ',
      unknown: '不明',
    },
    empty: {
      categories: 'カテゴリが見つかりませんでした。',
      products: 'このカテゴリに商品が見つかりませんでした。',
      items: 'この商品に該当するアイテムが見つかりませんでした。',
    },
    error: {
      title: '問題が発生しました',
      desc: 'ページを読み込めませんでした。しばらくしてから再度お試しください。',
    },
    search: {
      title: '検索結果',
      resultsFor: '「{keyword}」の検索結果',
      categoryFilter: {
        label: 'カテゴリ',
        all: 'すべてのカテゴリ',
      },
      emptyKeyword: '検索キーワードを入力してください。',
      noResults: '「{keyword}」に一致する商品が見つかりませんでした。',
    },
  },
  auth: {
    signon: {
      title: 'サインイン',
      usernameLabel: 'ユーザー名',
      passwordLabel: 'パスワード',
      submit: 'サインイン',
      submitting: 'サインイン中…',
      error: 'ユーザー名またはパスワードが正しくありません。',
    },
  },
  account: {
    register: {
      title: 'アカウント作成',
      usernameLabel: 'ユーザー名',
      passwordLabel: 'パスワード',
      repeatedPasswordLabel: 'パスワード（確認）',
      submit: 'アカウントを作成',
      submitting: 'アカウントを作成中…',
      error: {
        USERNAME_TAKEN: 'そのユーザー名は既に使用されています。別のユーザー名を選択してください。',
        RATE_LIMITED: '試行回数が多すぎます。しばらく待ってから再度お試しください。',
        VALIDATION_ERROR: '入力内容をご確認のうえ、もう一度お試しください。',
        default: 'アカウントを作成できませんでした。もう一度お試しください。',
      },
      passwordMismatch: 'パスワードが一致しません。',
    },
    edit: {
      title: 'アカウント設定',
      submit: '変更を保存',
      saving: '保存中…',
      success: 'アカウントを更新しました。',
      error: '変更を保存できませんでした。もう一度お試しください。',
      loadError: 'アカウント情報を読み込めませんでした。しばらくしてから再度お試しください。',
      conflict:
        'このアカウントは他の場所で更新されています。保存する前に最新の状態を再読み込みしてください。',
      reload: '最新の状態を再読み込み',
      languagePreferenceLabel: '言語設定',
      languageOptions: {
        english: 'English',
        japanese: '日本語',
      },
      colorSchemePreferenceLabel: 'テーマ',
      favoriteCategoryLabel: 'お気に入りカテゴリ',
      favoriteCategoryNone: 'なし',
      changePasswordLink: 'パスワードを変更',
    },
    password: {
      title: 'パスワード変更',
      currentPasswordLabel: '現在のパスワード',
      newPasswordLabel: '新しいパスワード',
      confirmNewPasswordLabel: '新しいパスワード（確認）',
      submit: 'パスワードを変更',
      submitting: 'パスワードを変更中…',
      success: 'パスワードを変更しました。',
      mismatch: '新しいパスワードと確認用パスワードが一致しません。',
      error: {
        INVALID_CURRENT_PASSWORD: '現在のパスワードが正しくありません。',
        WEAK_PASSWORD:
          'パスワードは8〜72文字で、大文字・小文字・数字・記号のうち2種類以上を含める必要があります。',
        default: 'パスワードを変更できませんでした。もう一度お試しください。',
      },
    },
    validation: {
      emailInvalid: '有効なメールアドレスを入力してください。',
      tooLong: 'この項目は長すぎます。',
      weakPassword:
        'パスワードは8〜72文字で、大文字・小文字・数字・記号のうち2種類以上を含める必要があります。',
    },
  },
  cart: {
    breadcrumb: 'カート',
    title: 'カート',
    table: {
      item: '商品',
      price: '価格',
      quantity: '数量',
      subtotal: '小計',
      remove: '削除',
    },
    subtotalLabel: '小計',
    checkout: 'レジに進む',
    remove: '削除',
    exceedsStockWarning:
      'この商品がカートに追加された後に在庫が変動したため、数量が在庫を超えている可能性があります。',
    empty: {
      title: 'カートは空です',
      desc: 'カタログを見て、ペットのためのお気に入りを見つけましょう。',
      browseCatalog: 'カタログを見る',
    },
    error: {
      title: '問題が発生しました',
      desc: 'カートを読み込めませんでした。しばらくしてから再度お試しください。',
    },
    addError: {
      OUT_OF_STOCK: 'この商品は現在在庫切れです。',
      EXCEEDS_STOCK: '指定した数量が在庫数を超えています。',
      INVALID_QUANTITY: '有効な数量を入力してください。',
      default: 'カートを更新できませんでした。もう一度お試しください。',
    },
    checkoutEmptyError: 'カートが見つからなかったため、注文を作成できませんでした。',
  },
  checkout: {
    breadcrumb: 'チェックアウト',
    steps: {
      cart: 'カート',
      address: '住所',
      confirm: '確認',
    },
    cartStep: {
      title: 'カートの確認',
      continue: '住所の入力へ進む',
    },
    addressStep: {
      title: '配送先・請求先住所',
      billingTitle: '請求先住所',
      shippingTitle: '配送先住所',
      useSeparateShipping: '別の配送先住所を指定する',
      back: 'カートに戻る',
      continue: '確認画面へ進む',
      fields: {
        firstName: '名',
        lastName: '姓',
        email: 'メールアドレス',
        phone: '電話番号',
        address1: '住所',
        address2: '建物名・部屋番号など',
        city: '市区町村',
        state: '都道府県',
        postalCode: '郵便番号',
        country: '国',
      },
    },
    confirmStep: {
      title: '内容の確認',
      billingTitle: '請求先住所',
      shippingTitle: '配送先住所',
      paymentTitle: 'お支払い',
      paymentPlaceholder: '本デモではカード情報の入力・保存は行いません。',
      back: '住所の入力に戻る',
      placeOrder: '注文を確定する',
      placing: '注文を送信中…',
      placeOrderError: {
        INSUFFICIENT_STOCK:
          'ご注文の商品の一部が、ご指定の数量では在庫不足のためご購入いただけません。カートの内容をご確認のうえ、再度お試しください。',
        default: '注文を確定できませんでした。もう一度お試しください。',
      },
    },
  },
  orderComplete: {
    title: 'ご注文ありがとうございました！',
    message: 'ご注文を承りました。',
    orderNumberLabel: '注文番号',
    totalLabel: '合計',
    continueShopping: '買い物を続ける',
  },
  order: {
    history: {
      title: '注文履歴',
      empty: 'これまでのご注文はありません。',
      table: {
        orderId: '注文番号',
        date: '注文日',
        total: '合計',
      },
    },
    detail: {
      title: '注文 #{orderId}',
      totalLabel: '合計',
      table: {
        product: '商品',
        price: '価格',
        quantity: '数量',
        subtotal: '小計',
      },
      unavailable: {
        title: '注文が見つかりません',
        desc: 'この注文が見つからないか、閲覧する権限がありません。',
      },
    },
  },
} as const
