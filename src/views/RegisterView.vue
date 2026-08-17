<script setup lang="ts">
// #13 AC1/AC2/AC3/AC6: ユーザー登録画面。SignonView(認証情報入力)+AddressForm(氏名/連絡先/住所)を
// 下敷きにする。langpref/favcategoryの入力欄は持たない(E5・サーバ既定値/未設定で登録される)。
// 成功時は自動ログイン済みのためredirectクエリ(相対パスのみ許可)へ復帰する(AC2/SBD-4)。
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AddressForm from '@/components/checkout/AddressForm.vue'
import { useAuthStore } from '@/stores/auth'
import { sanitizeRedirectTarget } from '@/utils/redirectValidator'
import { emptyAddress } from '@/domain/checkout'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const repeatedPassword = ref('')
const address = ref(emptyAddress())

// クライアント側の事前チェック(UX向上・サーバ側検証が権威。AC1)。空欄はネイティブrequired属性で防ぐ。
const passwordsMismatch = computed(
  () => repeatedPassword.value.length > 0 && password.value !== repeatedPassword.value,
)

const errorMessageKey = computed(() => {
  if (authStore.registerError === null) return null
  return `account.register.error.${authStore.registerError}`
})

async function handleSubmit() {
  if (passwordsMismatch.value) {
    return
  }
  const success = await authStore.register({
    ...address.value,
    username: username.value,
    password: password.value,
    repeatedPassword: repeatedPassword.value,
  })
  if (success) {
    router.push(sanitizeRedirectTarget(route.query.redirect))
  }
}
</script>

<template>
  <AppLayout>
    <div class="register">
      <form class="jps-card jps-card-pad register__form" @submit.prevent="handleSubmit">
        <h1 class="register__title">{{ t('account.register.title') }}</h1>

        <p v-if="errorMessageKey" class="jps-alert jps-alert-danger" role="alert">
          {{ t(errorMessageKey) }}
        </p>
        <p v-if="passwordsMismatch" class="jps-alert jps-alert-danger" role="alert">
          {{ t('account.register.error.PASSWORD_MISMATCH') }}
        </p>

        <div class="jps-field">
          <label class="jps-label jps-required" for="register-username">
            {{ t('account.register.usernameLabel') }}
          </label>
          <input
            id="register-username"
            v-model="username"
            name="username"
            type="text"
            class="jps-input"
            autocomplete="username"
            required
          />
        </div>

        <div class="jps-field">
          <label class="jps-label jps-required" for="register-password">
            {{ t('account.register.passwordLabel') }}
          </label>
          <input
            id="register-password"
            v-model="password"
            name="password"
            type="password"
            class="jps-input"
            autocomplete="new-password"
            required
          />
        </div>

        <div class="jps-field">
          <label class="jps-label jps-required" for="register-repeated-password">
            {{ t('account.register.repeatedPasswordLabel') }}
          </label>
          <input
            id="register-repeated-password"
            v-model="repeatedPassword"
            name="repeatedPassword"
            type="password"
            class="jps-input"
            autocomplete="new-password"
            required
          />
        </div>

        <AddressForm v-model="address" id-prefix="register" />

        <button
          type="submit"
          class="jps-btn jps-btn-primary jps-btn-block"
          :disabled="authStore.isRegistering"
        >
          {{
            authStore.isRegistering
              ? t('account.register.submitting')
              : t('account.register.submit')
          }}
        </button>
      </form>
    </div>
  </AppLayout>
</template>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.register__form {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.register__title {
  font-size: 1.375rem;
}
</style>
